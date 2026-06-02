import { useState } from 'react';
import { Plus, FolderOpen, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import type { Category } from '../types';
import { createCategory, updateCategory as apiUpdateCategory, deleteCategory as apiDeleteCategory } from '../services/api';

export function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, transactions, scheduledTransactions } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error('Por favor ingresa un nombre para la categoría');
      return;
    }

    // Nombre interno: concatenación de emoji + nombre para que el backend persista el icono
    const nombreInterno = icon ? `${icon} ${name}` : name;

    try {
      if (editingCategory) {
        if (editingCategory.backendId) {
          await apiUpdateCategory(editingCategory.backendId, nombreInterno, nombreInterno);
        }
        updateCategory(editingCategory.id, { name: nombreInterno, icon });
        toast.success('Información actualizada');
        setEditingCategory(null);
      } else {
        const backendCategory = await createCategory(nombreInterno, nombreInterno);
        addCategory({ name: nombreInterno, icon, backendId: backendCategory.id });
        toast.success('Categoría creada exitosamente');
      }
    } catch (error: any) {
      console.error('[CategoriesPage] Error al guardar categoría:', error);
      toast.error(error.message || 'Error al guardar la categoría');
    }

    // Reset form
    setName('');
    setIcon('📁');
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    // Si el nombre ya tiene el emoji al inicio, extraer solo el texto base para edición
    const nameParts = category.name.trimStart();
    const firstSpaceIdx = nameParts.indexOf(' ');
    const possibleEmoji = firstSpaceIdx >= 0 ? nameParts.slice(0, firstSpaceIdx) : '';
    const isEmojiPrefix = possibleEmoji === category.icon && possibleEmoji.length > 0;
    setName(isEmojiPrefix ? nameParts.slice(firstSpaceIdx + 1).trim() : category.name);
    setIcon(category.icon);
    setShowForm(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    } catch (error) {
      // Error ya manejado en el contexto
      setDeletingCategory(null);
    }
  };

  const getCategoryUsageCount = (categoryId: string) => {
    const transactionCount = transactions.filter(t => t.categoryId === categoryId).length;
    const scheduledCount = scheduledTransactions.filter(t => t.categoryId === categoryId).length;
    return transactionCount + scheduledCount;
  };

  const commonIcons = [
    '📁', '🏠', '🚗', '🍔', '🎬', '💡', '⚕️', '📚', '🎮', '🛍️',
    '💰', '💻', '📈', '✈️', '🏋️', '☕', '🎵', '📱', '🎨', '🌟'
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground mb-2">Categorías</h1>
          <p className="text-muted-foreground">
            Crea y gestiona categorías para organizar tus transacciones
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Formulario de Nueva/Editar Categoría */}
      {showForm && (
        <div className="bg-card p-6 rounded-xl shadow-md border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground">
                {editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
              </h2>
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-foreground mb-2">
                Nombre de la categoría
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Hogar, Gimnasio, Cine, etc."
                required
              />
            </div>

            {/* Selector de Icono */}
            <div>
              <label className="block text-foreground mb-2">
                Icono
              </label>
              <div className="grid grid-cols-10 gap-2 mb-3">
                {commonIcons.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all ${
                      icon === emoji
                        ? 'bg-primary text-primary-foreground scale-110 shadow-md'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="O escribe tu propio emoji"
                maxLength={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {editingCategory ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  setName('');
                  setIcon('📁');
                }}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Categorías */}
      <div>
        <h2 className="text-foreground mb-4">Todas las Categorías</h2>

        {categories.length === 0 ? (
          <div className="bg-card p-8 rounded-xl border border-border text-center">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-foreground mb-2">No hay categorías disponibles</h3>
            <p className="text-muted-foreground">
              Crea tu primera categoría para organizar tus transacciones
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-card p-4 rounded-xl border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-2xl shrink-0">
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground truncate">{category.name}</h3>
                    {category.isDefault && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                        Por defecto
                      </span>
                    )}
                    {!category.isDefault && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors text-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-card p-6 rounded-xl shadow-xl border border-border max-w-md w-full">
            <h2 className="text-foreground mb-4">¿Eliminar categoría?</h2>

            {getCategoryUsageCount(deletingCategory.id) > 0 ? (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-foreground text-sm">
                  Esta categoría está en uso en {getCategoryUsageCount(deletingCategory.id)} transacción(es).
                  Las transacciones se moverán a la categoría "Sin categoría".
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mb-4">
                ¿Estás seguro de que deseas eliminar la categoría "{deletingCategory.name}"?
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-destructive text-destructive-foreground py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Eliminar
              </button>
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
