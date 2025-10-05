import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const ProgramDetailsModal = ({ 
  open, 
  onClose, 
  program, 
  onSave 
}) => {
  // Initialize all hooks at the top level - never conditionally
  const [isEditing, setIsEditing] = useState(false);
  const [editedProgram, setEditedProgram] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // All hooks must be called in the same order every render
  useEffect(() => {
    if (program) {
      setEditedProgram({
        name: program.name || '',
        description: program.description || '',
        status: program.status || 'active',
        startDate: program.startDate || '',
        endDate: program.endDate || '',
        budget: program.budget || '',
        beneficiaries: program.beneficiaries || 0,
        location: program.location || '',
        coordinator: program.coordinator || '',
        ...program // Spread any additional properties
      });
    }
  }, [program]);

  // Reset editing state when modal closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setErrors({});
    }
  }, [open]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (program) {
      setEditedProgram({
        name: program.name || '',
        description: program.description || '',
        status: program.status || 'active',
        startDate: program.startDate || '',
        endDate: program.endDate || '',
        budget: program.budget || '',
        beneficiaries: program.beneficiaries || 0,
        location: program.location || '',
        coordinator: program.coordinator || '',
        ...program
      });
    }
    setErrors({});
  }, [program]);

  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});
      
      // Basic validation
      const newErrors = {};
      if (!editedProgram.name?.trim()) {
        newErrors.name = 'Program name is required';
      }
      if (!editedProgram.description?.trim()) {
        newErrors.description = 'Description is required';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      if (onSave) {
        await onSave(editedProgram);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving program:', error);
      setErrors({ general: 'Failed to save program details' });
    } finally {
      setLoading(false);
    }
  }, [editedProgram, onSave]);

  const handleInputChange = useCallback((field, value) => {
    setEditedProgram(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const handleClose = useCallback(() => {
    if (isEditing) {
      handleCancel();
    }
    onClose();
  }, [isEditing, handleCancel, onClose]);

  // Early return is OK as long as all hooks above are called first
  if (!program) {
    return null;
  }

  const getStatusColor = (status) => {
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
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            Program Details
          </Typography>
          <Box>
            {!isEditing && (
              <IconButton
                onClick={handleEdit}
                color="primary"
                sx={{ mr: 1 }}
                aria-label="Edit program"
              >
                <EditIcon />
              </IconButton>
            )}
            <IconButton
              onClick={handleClose}
              color="inherit"
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {errors.general && (
          <Box mb={2}>
            <Typography color="error" variant="body2">
              {errors.general}
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            {isEditing ? (
              <TextField
                fullWidth
                label="Program Name"
                value={editedProgram.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                variant="outlined"
              />
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Program Name
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {program.name}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={editedProgram.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={program.status || 'Unknown'}
                  color={getStatusColor(program.status)}
                  size="small"
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                label="Coordinator"
                value={editedProgram.coordinator || ''}
                onChange={(e) => handleInputChange('coordinator', e.target.value)}
                variant="outlined"
              />
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Coordinator
                </Typography>
                <Typography variant="body1">
                  {program.coordinator || 'Not assigned'}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={editedProgram.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                variant="outlined"
              />
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {program.description || 'No description available'}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={editedProgram.startDate || ''}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body1">
                  {program.startDate ? new Date(program.startDate).toLocaleDateString() : 'Not set'}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={editedProgram.endDate || ''}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  End Date
                </Typography>
                <Typography variant="body1">
                  {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'Not set'}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                type="number"
                label="Budget"
                value={editedProgram.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₱</Typography>,
                }}
              />
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Budget
                </Typography>
                <Typography variant="body1">
                  {program.budget ? `₱${Number(program.budget).toLocaleString()}` : 'Not set'}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <TextField
                fullWidth
                type="number"
                label="Beneficiaries"
                value={editedProgram.beneficiaries || ''}
                onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
                variant="outlined"
              />
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Beneficiaries
                </Typography>
                <Typography variant="body1">
                  {program.beneficiaries || 0}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12}>
            {isEditing ? (
              <TextField
                fullWidth
                label="Location"
                value={editedProgram.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                variant="outlined"
              />
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  {program.location || 'Not specified'}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {isEditing ? (
          <Box display="flex" gap={1}>
            <Button
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        ) : (
          <Button onClick={handleClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProgramDetailsModal;