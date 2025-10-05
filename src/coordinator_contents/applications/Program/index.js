import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Fab,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from '../../../components/PageTitleWrapper';
import ProgramDetailsModal from './ProgramDetailsModal';

// Mock data - replace with actual API calls
const mockPrograms = [
  {
    id: 1,
    name: 'Agricultural Support Program',
    description: 'Providing seeds, fertilizers, and training to farmers',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    budget: 5000000,
    beneficiaries: 150,
    location: 'Bataan Province',
    coordinator: 'Juan Dela Cruz',
  },
  {
    id: 2,
    name: 'Livestock Development Initiative',
    description: 'Supporting farmers with livestock breeding and management',
    status: 'pending',
    startDate: '2024-03-01',
    endDate: '2024-11-30',
    budget: 3500000,
    beneficiaries: 75,
    location: 'Zambales Province',
    coordinator: 'Maria Santos',
  },
  {
    id: 3,
    name: 'Rice Production Enhancement',
    description: 'Improving rice farming techniques and productivity',
    status: 'inactive',
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    budget: 2800000,
    beneficiaries: 200,
    location: 'Nueva Ecija Province',
    coordinator: 'Roberto Garcia',
  },
];

const ProgramManagement = () => {
  // All hooks declared at the top level, in consistent order
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [error, setError] = useState(null);

  // Load programs on component mount
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPrograms(mockPrograms);
        setError(null);
      } catch (err) {
        console.error('Error loading programs:', err);
        setError('Failed to load programs');
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, []);

  // Filter programs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPrograms(programs);
    } else {
      const filtered = programs.filter(program =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.coordinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPrograms(filtered);
    }
  }, [programs, searchTerm]);

  const handleViewProgram = useCallback((program) => {
    setSelectedProgram(program);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedProgram(null);
  }, []);

  const handleSaveProgram = useCallback(async (updatedProgram) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPrograms(prev => 
        prev.map(program => 
          program.id === updatedProgram.id 
            ? { ...program, ...updatedProgram }
            : program
        )
      );
      
      setSelectedProgram({ ...selectedProgram, ...updatedProgram });
    } catch (err) {
      console.error('Error saving program:', err);
      throw new Error('Failed to save program');
    }
  }, [selectedProgram]);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  }, []);

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <PageTitleWrapper>
          <Typography variant="h3" component="h3" gutterBottom>
            Program Management
          </Typography>
          <Typography variant="subtitle2">
            Loading programs...
          </Typography>
        </PageTitleWrapper>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Program Management - RSBSA Coordinator</title>
      </Helmet>
      
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              Program Management
            </Typography>
            <Typography variant="subtitle2">
              Manage and monitor agricultural programs and initiatives
            </Typography>
          </Grid>
          <Grid item>
            <Button
              sx={{ mt: { xs: 2, md: 0 } }}
              variant="contained"
              startIcon={<AddIcon />}
            >
              Add New Program
            </Button>
          </Grid>
        </Grid>
      </PageTitleWrapper>

      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Search and Filter */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    variant="outlined"
                    size="small"
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    size="small"
                  >
                    Filter
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Programs Statistics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Programs
                </Typography>
                <Typography variant="h4">
                  {programs.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Programs
                </Typography>
                <Typography variant="h4" color="success.main">
                  {programs.filter(p => p.status === 'active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Beneficiaries
                </Typography>
                <Typography variant="h4">
                  {programs.reduce((total, p) => total + p.beneficiaries, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Budget
                </Typography>
                <Typography variant="h4">
                  ₱{programs.reduce((total, p) => total + p.budget, 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Programs Table */}
          <Grid item xs={12}>
            <Card>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Program Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Coordinator</TableCell>
                      <TableCell>Beneficiaries</TableCell>
                      <TableCell>Budget</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPrograms.map((program) => (
                      <TableRow key={program.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {program.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {program.description.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={program.status}
                            color={getStatusColor(program.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {program.coordinator}
                        </TableCell>
                        <TableCell>
                          {program.beneficiaries}
                        </TableCell>
                        <TableCell>
                          ₱{program.budget.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {program.location}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewProgram(program)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredPrograms.length === 0 && (
                <Box p={3} textAlign="center">
                  <Typography color="text.secondary">
                    {searchTerm ? 'No programs found matching your search.' : 'No programs available.'}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add program"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>

        {/* Program Details Modal */}
        <ProgramDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          program={selectedProgram}
          onSave={handleSaveProgram}
        />
      </Container>
    </>
  );
};

export default ProgramManagement;