// src/components/Books/BookTable.tsx
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Checkbox,
  Chip,
  TablePagination,
  TableSortLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import { Book } from '../../types/book';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../common/ConfirmationDialog';

interface BookTableProps {
  books: Book[];
  loading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  order: 'asc' | 'desc';
  orderBy: keyof Book;
  onRequestSort: (property: keyof Book) => void;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (id: number) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'PPpp', { locale: es });
};

const BookTable: React.FC<BookTableProps> = ({
  books,
  loading,
  pagination,
  order,
  orderBy,
  onRequestSort,
  onChangePage,
  onChangeRowsPerPage,
  onEditBook,
  onDeleteBook
}) => {

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [bookToDelete, setBookToDelete] = React.useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setBookToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bookToDelete) {
      onDeleteBook(bookToDelete);
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setBookToDelete(null);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => onRequestSort('title')}
                >
                  Título
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'author'}
                  direction={orderBy === 'author' ? order : 'asc'}
                  onClick={() => onRequestSort('author')}
                >
                  Autor
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'editorial'}
                  direction={orderBy === 'editorial' ? order : 'asc'}
                  onClick={() => onRequestSort('editorial')}
                >
                  Editorial
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'price'}
                  direction={orderBy === 'price' ? order : 'asc'}
                  onClick={() => onRequestSort('price')}
                >
                  Precio
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'disponibilidad'}
                  direction={orderBy === 'disponibilidad' ? order : 'asc'}
                  onClick={() => onRequestSort('disponibilidad')}
                >
                  Disponible
                </TableSortLabel>
              </TableCell>
              <TableCell>Género</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={orderBy === 'createdAt' ? order : 'asc'}
                  onClick={() => onRequestSort('createdAt')}
                >
                  Creado
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'updatedAt'}
                  direction={orderBy === 'updatedAt' ? order : 'asc'}
                  onClick={() => onRequestSort('updatedAt')}
                >
                  Actualizado
                </TableSortLabel>
              </TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>Cargando libros...</Typography>
                </TableCell>
              </TableRow>
            ) : !books || books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No se encontraron libros
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.editorial}</TableCell>
                  <TableCell>${book.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Checkbox checked={book.disponibilidad} disabled />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={book.gender}
                      color={
                        book.gender === 'Ciencia Ficción' ? 'primary' :
                          book.gender === 'Fantasía' ? 'secondary' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(book.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(book.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar libro">
                      <IconButton onClick={() => onEditBook(book)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar libro">
                      <IconButton onClick={() => handleDeleteClick(book.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={pagination.total}
        rowsPerPage={pagination.pageSize}
        page={pagination.page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        labelRowsPerPage="Libros por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro que deseas eliminar este libro? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default BookTable;