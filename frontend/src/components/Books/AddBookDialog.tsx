import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Avatar,
  IconButton,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (image?: File | null) => void;
  bookData: {
    title: string;
    author: string;
    editorial: string;
    price: number;
    disponibilidad: boolean;
    gender: string;
    imageUrl?: string | null;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: { target: { name: string; value: string } }) => void;
  loading: boolean;
  error: string | null;
  isEditMode?: boolean;
  onImageChange: (image: File | null, removeExisting: boolean) => void;
  onDeleteImage?: (bookId: number) => Promise<void>;
  bookId?: number;
}

const AddBookDialog: React.FC<AddBookDialogProps> = ({
  open,
  onClose,
  onSubmit,
  bookData,
  onInputChange,
  onCheckboxChange,
  onSelectChange,
  loading,
  error,
  isEditMode = false,
  onImageChange,
  onDeleteImage,
  bookId
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      setImageError('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validar tamaño (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('La imagen no debe superar los 2MB');
      return;
    }

    setImageError(null);
    setImage(file);
    onImageChange(file, false);
  };

  const handleRemoveImage = async () => {
    try {
      setIsRemovingImage(true);

      if (isEditMode && bookId && onDeleteImage) {
        await onDeleteImage(bookId);
        setImage(null);
        onImageChange(null, true);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setImage(null);
        onImageChange(null, false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error removing image:', error);
      enqueueSnackbar('Error al eliminar la imagen', { variant: 'error' });
    } finally {
      setIsRemovingImage(false);
    }
  };

  const handleSubmit = () => {
    if (imageError) return;
    onSubmit(image);
  };

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/images')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/books${url}`;
    }

    return url;
  };

  const imagePreview = image ? URL.createObjectURL(image) : getImageUrl(bookData.imageUrl) || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Editar Libro' : 'Agregar Nuevo Libro'}</DialogTitle>
      <DialogContent>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: 2
        }}>
          <TextField
            name="title"
            label="Título"
            value={bookData.title}
            onChange={onInputChange}
            fullWidth
            required
          />

          <TextField
            name="author"
            label="Autor"
            value={bookData.author}
            onChange={onInputChange}
            fullWidth
            required
          />

          <TextField
            name="editorial"
            label="Editorial"
            value={bookData.editorial}
            onChange={onInputChange}
            fullWidth
            required
          />

          <TextField
            name="price"
            label="Precio"
            type="number"
            value={bookData.price}
            onChange={onInputChange}
            fullWidth
            inputProps={{ step: "0.01", min: "0" }}
            required
          />

          <FormControl fullWidth required>
            <InputLabel id="gender-label">Género</InputLabel>
            <Select
              name="gender"
              labelId="gender-label"
              value={bookData.gender}
              onChange={onSelectChange}
              label="Género"
            >
              <MenuItem value="Novela">Novela</MenuItem>
              <MenuItem value="Ciencia Ficción">Ciencia Ficción</MenuItem>
              <MenuItem value="Fantasía">Fantasía</MenuItem>
              <MenuItem value="Histórico">Histórico</MenuItem>
              <MenuItem value="Biografía">Biografía</MenuItem>
              <MenuItem value="Poesía">Poesía</MenuItem>
              <MenuItem value="Ficción">Ficción</MenuItem>
            </Select>
          </FormControl>



          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              name="disponibilidad"
              checked={bookData.disponibilidad}
              onChange={onCheckboxChange}
            />
            <Typography>Disponible</Typography>
          </Box>


          <Stack direction="column" spacing={2} alignItems="flex-start">


            {imagePreview && (
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={imagePreview}
                  variant="rounded"
                  sx={{ width: 150, height: 150, objectFit: 'cover' }}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  disabled={loading || isRemovingImage}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    color: 'error.main',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    }
                  }}
                >
                  {isRemovingImage ? <CircularProgress size={24} /> : <DeleteIcon />}
                </IconButton>
              </Box>
            )}

            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
            >
              {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
              <VisuallyHiddenInput
                type="file"
                accept="image/jpeg, image/png, image/gif, image/webp"
                onChange={handleImageChange}
                ref={fileInputRef}
                disabled={loading}
              />
            </Button>

            <Typography variant="caption" color="textSecondary">
              Formatos aceptados: JPEG, PNG, GIF, WEBP (Máx. 2MB)
            </Typography>

            {imageError && (
              <Typography color="error" variant="caption">
                {imageError}
              </Typography>
            )}
          </Stack>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !!imageError}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEditMode ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBookDialog;