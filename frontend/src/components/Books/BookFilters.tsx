// src/components/Books/BookFilters.tsx
import React from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface BookFiltersProps {
  filters: {
    search: string;
    title: string;
    author: string;
    editorial: string;
    gender: string;
    minPrice?: string; // Ahora acepta minPrice como string opcional
    maxPrice?: string; // Ahora acepta maxPrice como string opcional
  };
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: { target: { name: string; value: string } }) => void;
  onApplyFilters: () => void;
  onFilterKeyPress: (e: React.KeyboardEvent) => void;
}

const BookFilters: React.FC<BookFiltersProps> = ({
  filters,
  onFilterChange,
  onSelectChange,
  onApplyFilters,
  onFilterKeyPress
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          name="search"
          label="Búsqueda general"
          value={filters.search}
          onChange={onFilterChange}
          onKeyPress={onFilterKeyPress}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          name="title"
          label="Filtrar por título"
          value={filters.title}
          onChange={onFilterChange}
          onKeyPress={onFilterKeyPress}
          size="small"
        />
        <TextField
          name="author"
          label="Filtrar por autor"
          value={filters.author}
          onChange={onFilterChange}
          onKeyPress={onFilterKeyPress}
          size="small"
        />
        <TextField
          name="editorial"
          label="Filtrar por editorial"
          value={filters.editorial}
          onChange={onFilterChange}
          onKeyPress={onFilterKeyPress}
          size="small"
        />

        <Button 
          variant="contained" 
          onClick={onApplyFilters}
          sx={{ height: 40, alignSelf: 'center' }}
        >
          Aplicar Filtros
        </Button>
      </Box>
    </Paper>
  );
};

export default BookFilters;