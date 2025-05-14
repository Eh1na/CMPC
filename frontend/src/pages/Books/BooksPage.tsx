import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../../hooks/useBooks';
import BookTable from '../../components/Books/BookTable';
import BookFilters from '../../components/Books/BookFilters';
import AddBookDialog from '../../components/Books/AddBookDialog';
import { Book, PaginationParams } from '../../types/book';
import { saveAs } from 'file-saver';
import DownloadIcon from '@mui/icons-material/Download';
import { useSnackbar } from 'notistack';
import { Slide } from '@mui/material';

const BooksPage: React.FC = () => {
  // Estados del componente
  const [openDialog, setOpenDialog] = useState(false);
  const [authErrorDialog, setAuthErrorDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof Book>('title');
  const [isExporting, setIsExporting] = useState(false);

  const handleDeleteImage = async (bookId: number) => {
    try {
      await deleteBookImage(bookId);
      enqueueSnackbar('Imagen eliminada correctamente', { 
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });
      
      // Actualizar el estado local si estamos editando
      if (isEditMode && currentBook) {
        setNewBook(prev => ({ ...prev, imageUrl: null }));
      }
      
      // Recargar datos
      await fetchBooks(initialParams);
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Error al eliminar la imagen', { 
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });
    }
  };
  // Estado para el nuevo libro
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    editorial: '',
    price: 0,
    disponibilidad: true,
    gender: '',
    imageUrl: null as string | null
  });

  // Filtros del servidor
  const [serverFilters, setServerFilters] = useState({
    search: '',
    title: '',
    author: '',
    editorial: '',
    gender: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined
  });

  // Configuración inicial de parámetros
  const initialParams: PaginationParams = {
    page: 1,
    limit: 5,
    sortField: orderBy,
    sortOrder: order === 'asc' ? 'ASC' : 'DESC',
    ...(serverFilters.search && { search: serverFilters.search }),
    ...(serverFilters.title && { title: serverFilters.title }),
    ...(serverFilters.author && { author: serverFilters.author }),
    ...(serverFilters.editorial && { editorial: serverFilters.editorial }),
    ...(serverFilters.gender && { gender: serverFilters.gender }),
    ...(serverFilters.minPrice !== undefined && { minPrice: serverFilters.minPrice }),
    ...(serverFilters.maxPrice !== undefined && { maxPrice: serverFilters.maxPrice })
  };

  // Hooks
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // Hook personalizado para manejar libros
  const {
    books,
    loading,
    error,
    pagination,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    exportBooksToExcel,
    deleteBookImage 
  } = useBooks(initialParams);

  // Efecto para manejar errores de autenticación
  useEffect(() => {
    if (error && (error.includes('SESSION_EXPIRED') || error.includes('401'))) {
      setAuthErrorDialog(true);
    }
  }, [error]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchBooks(initialParams);
  }, []);

  // Manejadores de eventos
  const handleEditBook = (book: Book) => {
    setCurrentBook(book);
    setIsEditMode(true);
    setNewBook({
      title: book.title,
      author: book.author,
      editorial: book.editorial,
      price: book.price,
      disponibilidad: book.disponibilidad,
      gender: book.gender,
      imageUrl: book.imageUrl || null
    });
    setOpenDialog(true);
  };

  const handleAddOrUpdateBook = async (image?: File | null) => {
    if (!newBook.title || !newBook.author || !newBook.editorial || !newBook.gender) {
      enqueueSnackbar('Por favor complete todos los campos requeridos', { 
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });
      return;
    }

    try {
      if (isEditMode && currentBook) {
        await updateBook(currentBook.id, newBook, image);
        enqueueSnackbar('Libro actualizado exitosamente', { 
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
      } else {
        await addBook(newBook, image as File);
        enqueueSnackbar('Libro creado exitosamente', { 
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'center' }
        });
      }
      handleCloseDialog();
      fetchBooks({
        ...initialParams,
        page: pagination.page,
        limit: pagination.limit
      });
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Error al guardar el libro', { 
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setIsEditMode(false);
    setCurrentBook(null);
    setNewBook({
      title: '',
      author: '',
      editorial: '',
      price: 0,
      disponibilidad: true,
      gender: '',
      imageUrl: null
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ 
      ...prev, 
      [name]: name === 'price' ? Number(value) : value 
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewBook(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestSort = (property: keyof Book) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    fetchBooks({
      ...initialParams,
      sortField: property,
      sortOrder: isAsc ? 'DESC' : 'ASC',
      page: 1
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    fetchBooks({
      ...initialParams,
      page: newPage + 1
    });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    fetchBooks({
      ...initialParams,
      page: 1,
      limit: newLimit
    });
  };

  const handleServerFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServerFilters(prev => ({
      ...prev,
      [name]: name.includes('Price') ? (value ? Number(value) : undefined) : value
    }));
  };

  const handleFilterKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyServerFilters();
    }
  };

  const applyServerFilters = () => {
    fetchBooks({
      ...initialParams,
      page: 1
    });
  };

  const handleNavigateToAuth = () => {
    navigate('/auth');
  };

  const handleCloseAuthErrorDialog = () => {
    setAuthErrorDialog(false);
  };

  const handleExportExcel = async () => {
    const loadingKey = enqueueSnackbar('Generando archivo Excel...', {
      variant: 'default',
      persist: true,
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      TransitionComponent: Slide,
      content: (
        <Alert icon={<CircularProgress size={20} color="inherit" />} severity="info">
          Exportando datos, por favor espere...
        </Alert>
      ),
    });

    setIsExporting(true);

    try {
      const blob = await exportBooksToExcel();
      const fileName = `libros_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      closeSnackbar(loadingKey);
      enqueueSnackbar('Exportación a Excel generada', { 
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });
    } catch (error) {
      closeSnackbar(loadingKey);
      enqueueSnackbar('Error al generar el archivo Excel', { 
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' }
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImageChange = (image: File | null, removeExisting: boolean) => {
    setNewBook(prev => ({
      ...prev,
      imageUrl: removeExisting ? null : prev.imageUrl
    }));
  };

  return (
    <Box sx={{ p: 4, mt: '64px' }}>
      {/* Header con título y botones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">Lista de Libros</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleOpenDialog}>
            Agregar Libro
          </Button>
          <Button
            variant="outlined"
            onClick={handleExportExcel}
            startIcon={<DownloadIcon />}
            disabled={loading || isExporting}
          >
            Exportar Excel
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <BookFilters
        filters={{
          ...serverFilters,
          minPrice: serverFilters.minPrice?.toString() || '',
          maxPrice: serverFilters.maxPrice?.toString() || ''
        }}
        onFilterChange={handleServerFilterChange}
        onSelectChange={handleSelectChange}
        onApplyFilters={applyServerFilters}
        onFilterKeyPress={handleFilterKeyPress}
      />

      {/* Tabla de libros */}
      <BookTable
        books={books}
        loading={loading}
        pagination={{
          page: pagination.page - 1,
          pageSize: pagination.limit,
          total: pagination.total
        }}
        order={order}
        orderBy={orderBy}
        onRequestSort={handleRequestSort}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        onEditBook={handleEditBook}
        onDeleteBook={deleteBook}
      />

      {/* Diálogo para agregar/editar libros */}
      <AddBookDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleAddOrUpdateBook}
        bookData={newBook}
        onInputChange={handleInputChange}
        onCheckboxChange={handleCheckboxChange}
        onSelectChange={handleSelectChange}
        loading={loading}
        error={error}
        isEditMode={isEditMode}
        onImageChange={handleImageChange}
        onDeleteImage={isEditMode ? handleDeleteImage : undefined}
        bookId={isEditMode && currentBook ? currentBook.id : undefined}
      />

      {/* Diálogo de error de autenticación */}
      <Dialog
        open={authErrorDialog}
        onClose={handleCloseAuthErrorDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Error de Autenticación</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Su token de acceso ha expirado o es inválido. Por favor inicie sesión nuevamente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAuthErrorDialog}>Cancelar</Button>
          <Button onClick={handleNavigateToAuth} color="primary" autoFocus>
            Ir a Inicio de Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BooksPage;