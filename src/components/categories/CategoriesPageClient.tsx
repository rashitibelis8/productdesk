'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';
import { categorySchema, type CategoryInput } from '@/lib/validations';

interface CategoryRow {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  _count: { products: number };
}

const PAGE_SIZE = 8;

function CategoryFormModal({
  isOpen,
  initial,
  categories,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  initial?: CategoryRow;
  categories: CategoryRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema) });

  useEffect(() => {
    if (isOpen) {
      reset({ name: initial?.name ?? '', parentId: initial?.parentId ?? '' });
      setFormError(null);
    }
  }, [isOpen, initial, reset]);

  // Parent options: top-level categories only, excluding this category itself
  // and any category that is currently one of its children (server also rejects those).
  const parentOptions = categories.filter(
    (c) => c.parentId === null && c.id !== initial?.id && c.parentId !== initial?.id
  );

  const onSubmit = async (data: CategoryInput) => {
    setFormError(null);
    const url = initial ? `/api/categories/${initial.id}` : '/api/categories';
    const method = initial ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, parentId: data.parentId || null }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.message ?? 'Something went wrong');
      return;
    }

    showToast(initial ? 'Category updated' : 'Category created', 'success');
    onSaved();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Category' : 'Add Category'} maxWidthClass="max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <div className="rounded-lg bg-error/10 px-3 py-2 font-body-md text-body-md text-error">{formError}</div>
        )}
        <Input label="Category Name" error={errors.name?.message} {...register('name')} />
        <Select label="Parent Category" error={errors.parentId?.message} {...register('parentId')}>
          <option value="">No parent (top-level)</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface DisplayRow {
  category: CategoryRow;
  isChild: boolean;
  parentName: string | null;
}

export function CategoriesPageClient({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formModal, setFormModal] = useState<{ open: boolean; editing?: CategoryRow }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
    setIsLoading(false);
  };

  // The server already rendered the initial list — skip the redundant first fetch.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSaved = () => {
    setFormModal({ open: false });
    loadCategories();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' });
    setIsDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      showToast('Category deleted', 'success');
      loadCategories();
    } else {
      showToast('Failed to delete category', 'error');
    }
  };

  // Build the hierarchical (root -> children) row list, honoring the search filter.
  const { rootGroups, totalMatches } = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matchedIds = new Set(
      term ? categories.filter((c) => c.name.toLowerCase().includes(term)).map((c) => c.id) : categories.map((c) => c.id)
    );

    // Keep hierarchy context: if a child matches, pull in its parent; if a root
    // matches, pull in all of its children.
    const byId = new Map(categories.map((c) => [c.id, c]));
    const includedIds = new Set(matchedIds);
    if (term) {
      matchedIds.forEach((id) => {
        const cat = byId.get(id);
        if (!cat) return;
        if (cat.parentId) {
          includedIds.add(cat.parentId);
        } else {
          categories.forEach((c) => {
            if (c.parentId === cat.id) includedIds.add(c.id);
          });
        }
      });
    }

    const included = categories.filter((c) => includedIds.has(c.id));
    const roots = included
      .filter((c) => c.parentId === null)
      .sort((a, b) => a.name.localeCompare(b.name));
    const childrenByParent = new Map<string, CategoryRow[]>();
    included
      .filter((c) => c.parentId !== null)
      .forEach((c) => {
        const key = c.parentId as string;
        if (!childrenByParent.has(key)) childrenByParent.set(key, []);
        childrenByParent.get(key)!.push(c);
      });
    childrenByParent.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));

    const groups = roots.map((root) => ({
      root,
      children: (childrenByParent.get(root.id) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    }));

    return { rootGroups: groups, totalMatches: included.length };
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(rootGroups.length / PAGE_SIZE));
  const pagedGroups = rootGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const displayRows: DisplayRow[] = pagedGroups.flatMap((group) => [
    { category: group.root, isChild: false, parentName: null },
    ...group.children.map((child) => ({ category: child, isChild: true, parentName: group.root.name })),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">Categories</h1>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            Manage your product classification and hierarchy.
          </p>
        </div>
        <Button onClick={() => setFormModal({ open: true })}>
          <Icon name="add" size={18} />
          Add Category
        </Button>
      </div>

      <div className="relative w-full md:max-w-md">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <Input
          placeholder="Search categories..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        {isLoading ? (
          <p className="p-6 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            Loading categories&hellip;
          </p>
        ) : totalMatches === 0 ? (
          <p className="p-6 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            {search ? 'No categories match your search.' : 'No categories yet. Add your first category to organize products.'}
          </p>
        ) : (
          <>
            <Table>
              <Thead>
                <Tr>
                  <Th>Category Name</Th>
                  <Th>Hierarchy</Th>
                  <Th className="text-right">Products Count</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {displayRows.map(({ category, isChild, parentName }) => (
                  <Tr key={category.id} className="group">
                    <Td className={isChild ? 'relative py-4 pl-12' : 'py-4'}>
                      {isChild && (
                        <>
                          <div className="absolute bottom-1/2 left-6 top-0 w-px bg-outline-variant dark:bg-outline" />
                          <div className="absolute left-6 top-1/2 h-px w-4 bg-outline-variant dark:bg-outline" />
                        </>
                      )}
                      <div className="relative z-10 flex items-center gap-3">
                        <div
                          className={
                            isChild
                              ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-container-highest text-on-surface-variant dark:bg-surface-variant dark:text-surface-variant'
                              : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-container/40 text-primary dark:bg-primary/20 dark:text-inverse-primary'
                          }
                        >
                          <Icon name="category" size={18} />
                        </div>
                        <span className="font-medium text-on-surface dark:text-inverse-on-surface">{category.name}</span>
                      </div>
                    </Td>
                    <Td className="text-on-surface-variant dark:text-surface-variant">{parentName ?? 'Root'}</Td>
                    <Td className="text-right font-code text-code text-on-surface-variant dark:text-surface-variant">
                      {category._count.products}
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          aria-label="Edit"
                          className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-primary-fixed/30 hover:text-primary dark:text-surface-variant"
                          onClick={() => setFormModal({ open: true, editing: category })}
                        >
                          <Icon name="edit" size={18} />
                        </button>
                        <button
                          aria-label="Delete"
                          className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-error-container/30 hover:text-error dark:text-surface-variant"
                          onClick={() => setDeleteTarget(category)}
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={rootGroups.length}
              pageSize={PAGE_SIZE}
              variant="numbered"
            />
          </>
        )}
      </Card>

      <CategoryFormModal
        isOpen={formModal.open}
        initial={formModal.editing}
        categories={categories}
        onClose={() => setFormModal({ open: false })}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Products in this category will become uncategorized.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
