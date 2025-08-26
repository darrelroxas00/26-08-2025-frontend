/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import the custom hook
import usePersonalDetails from './hooks/userPersonalDetail';

// Utility functions
const calculateAge = (birthDate) => {
  try {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    // Validate dates
    if (isNaN(birth.getTime()) || isNaN(today.getTime())) {
      return null;
    }
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age > 0 ? age : null;
  } catch (error) {
    console.error('Age calculation error:', error);
    return null;
  }
};

const formatDate = (dateString) => {
  try {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  }
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main
  }
}));

const PersonalDetails = () => {
  // Get user ID from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  const userId = storedUser.id || storedUser.user_id;

  const {
    formData,
    errors,
    loading,
    saving,
    barangayOptions,
    civilStatusOptions,
    educationOptions,
    yesNoOptions,
    updateField,
    validateForm,
    savePersonalDetails,
    getCompletionPercentage,
    resetForm
  } = usePersonalDetails(userId);

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Government ID types
  const govIdTypes = [
    'SSS ID', 'PhilHealth ID', 'TIN ID', 'Driver\'s License', 'Passport',
    'Postal ID', 'Voter\'s ID', 'Senior Citizen ID', 'PWD ID', 'UMID'
  ];

  // Handle save
  const handleSave = async () => {
    const success = await savePersonalDetails();
    if (success) {
      setIsEditing(false);
      setSaveSuccess(true);
      setSaveError('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Failed to save personal details. Please try again.');
      setTimeout(() => setSaveError(''), 3000);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    // Optionally reload data or reset form
  };

  // Get completion status color
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const completionPercentage = getCompletionPercentage();

  if (loading) {
    return (
      <StyledCard>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading personal details...</Typography>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Progress Section */}
      <ProgressContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            Profile Completion
          </Typography>
          <Chip 
            label={`${completionPercentage}% Complete`}
            color={getCompletionColor(completionPercentage)}
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          color={getCompletionColor(completionPercentage)}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4
            }
          }} 
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Complete your profile to access all features and services
        </Typography>
      </ProgressContainer>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Personal details saved successfully!
        </Alert>
      )}
      
      {saveError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {saveError}
        </Alert>
      )}

      {/* Main Personal Details Card */}
      <StyledCard>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
          }
          title={
            <Typography variant="h5" fontWeight="bold">
              Personal Details
            </Typography>
          }
          subheader="Manage your personal information and profile details"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!isEditing ? (
                <Tooltip title="Edit Profile">
                  <IconButton 
                    color="primary" 
                    onClick={() => setIsEditing(true)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Tooltip title="Save Changes">
                    <IconButton 
                      color="primary" 
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton 
                      color="error" 
                      onClick={handleCancel}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          }
        />
        
        <CardContent>
          {/* RSBSA Information Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <BadgeIcon />
                <Typography variant="h6" fontWeight="bold">RSBSA Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="System Generated RSBSA Number"
                    value={formData.system_generated_rsbsa_number || 'Not yet assigned'}
                    disabled
                    variant="filled"
                    InputProps={{ readOnly: true }}
                    helperText="This number is automatically generated by the system"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Manual RSBSA Number"
                    value={formData.manual_rsbsa_number || 'Not provided'}
                    disabled
                    variant="filled"
                    InputProps={{ readOnly: true }}
                    helperText="This number is assigned by DA office"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Location Information Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <HomeIcon />
                <Typography variant="h6" fontWeight="bold">Location Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.barangay}>
                    <InputLabel>Barangay *</InputLabel>
                    <Select
                      value={formData.barangay}
                      onChange={(e) => updateField('barangay', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                    >
                      {barangayOptions.map((barangay) => (
                        <MenuItem key={barangay} value={barangay}>
                          {barangay}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.barangay && (
                      <Typography variant="caption" color="error">
                        {errors.barangay}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Municipality"
                    value={formData.municipality}
                    disabled
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Province"
                    value={formData.province}
                    disabled
                    variant="filled"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Region"
                    value={formData.region}
                    disabled
                    variant="filled"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Contact Information Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <PhoneIcon />
                <Typography variant="h6" fontWeight="bold">Contact Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Number *"
                    value={formData.contact_number}
                    onChange={(e) => updateField('contact_number', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{ readOnly: !isEditing }}
                    error={!!errors.contact_number}
                    helperText={errors.contact_number || "Format: 09XXXXXXXXX"}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Number"
                    value={formData.emergency_contact_number}
                    onChange={(e) => updateField('emergency_contact_number', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{ readOnly: !isEditing }}
                    error={!!errors.emergency_contact_number}
                    helperText={errors.emergency_contact_number || "Format: 09XXXXXXXXX"}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Personal Information Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <PersonIcon />
                <Typography variant="h6" fontWeight="bold">Personal Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Birth Date *"
                    value={formData.birth_date ? new Date(formData.birth_date) : null}
                    onChange={(date) => updateField('birth_date', date?.toISOString().split('T')[0])}
                    disabled={!isEditing}
                    maxDate={new Date()}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.birth_date}
                        helperText={errors.birth_date}
                        variant={isEditing ? "outlined" : "filled"}
                      />
                    )}
                  />
                  
                  {/* Age Display */}
                  {formData.birth_date && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`Age: ${calculateAge(formData.birth_date)} years old`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Born: {formatDate(formData.birth_date)}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Place of Birth"
                    value={formData.place_of_birth}
                    onChange={(e) => updateField('place_of_birth', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{ readOnly: !isEditing }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.sex}>
                    <InputLabel>Sex *</InputLabel>
                    <Select
                      value={formData.sex}
                      onChange={(e) => updateField('sex', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </Select>
                    {errors.sex && (
                      <Typography variant="caption" color="error">
                        {errors.sex}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Civil Status</InputLabel>
                    <Select
                      value={formData.civil_status}
                      onChange={(e) => updateField('civil_status', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                    >
                      {civilStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {formData.civil_status === 'married' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name of Spouse *"
                      value={formData.name_of_spouse}
                      onChange={(e) => updateField('name_of_spouse', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                      InputProps={{ readOnly: !isEditing }}
                      error={!!errors.name_of_spouse}
                      helperText={errors.name_of_spouse}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mother's Maiden Name"
                    value={formData.mothers_maiden_name}
                    onChange={(e) => updateField('mothers_maiden_name', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{ readOnly: !isEditing }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Educational & Demographic Information Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <SchoolIcon />
                <Typography variant="h6" fontWeight="bold">Educational & Demographic Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Highest Education</InputLabel>
                    <Select
                      value={formData.highest_education}
                      onChange={(e) => updateField('highest_education', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                    >
                      {educationOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Religion"
                    value={formData.religion}
                    onChange={(e) => updateField('religion', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? "outlined" : "filled"}
                    InputProps={{ readOnly: !isEditing }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_pwd}
                        onChange={(e) => updateField('is_pwd', e.target.checked)}
                        disabled={!isEditing}
                      />
                    }
                    label="Person with Disability (PWD)"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Government ID Information Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <BadgeIcon />
                <Typography variant="h6" fontWeight="bold">Government ID Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Has Government ID</InputLabel>
                    <Select
                      value={formData.has_government_id}
                      onChange={(e) => updateField('has_government_id', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                    >
                      {yesNoOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {formData.has_government_id === 'yes' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.gov_id_type}>
                        <InputLabel>Government ID Type *</InputLabel>
                        <Select
                          value={formData.gov_id_type}
                          onChange={(e) => updateField('gov_id_type', e.target.value)}
                          disabled={!isEditing}
                          variant={isEditing ? "outlined" : "filled"}
                        >
                          {govIdTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.gov_id_type && (
                          <Typography variant="caption" color="error">
                            {errors.gov_id_type}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Government ID Number *"
                        value={formData.gov_id_number}
                        onChange={(e) => updateField('gov_id_number', e.target.value)}
                        disabled={!isEditing}
                        variant={isEditing ? "outlined" : "filled"}
                        InputProps={{ readOnly: !isEditing }}
                        error={!!errors.gov_id_number}
                        helperText={errors.gov_id_number}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Association & Organization Membership Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <GroupIcon />
                <Typography variant="h6" fontWeight="bold">Association & Organization Membership</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Association Member</InputLabel>
                    <Select
                      value={formData.is_association_member}
                      onChange={(e) => updateField('is_association_member', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                    >
                      {yesNoOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {formData.is_association_member === 'yes' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Association Name *"
                      value={formData.association_name}
                      onChange={(e) => updateField('association_name', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                      InputProps={{ readOnly: !isEditing }}
                      error={!!errors.association_name}
                      helperText={errors.association_name}
                    />
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Household Information Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <SectionHeader>
                <HomeIcon />
                <Typography variant="h6" fontWeight="bold">Household Information</Typography>
              </SectionHeader>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_household_head}
                        onChange={(e) => updateField('is_household_head', e.target.checked)}
                        disabled={!isEditing}
                      />
                    }
                    label="I am the household head"
                  />
                </Grid>
                {!formData.is_household_head && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Household Head Name *"
                      value={formData.household_head_name}
                      onChange={(e) => updateField('household_head_name', e.target.value)}
                      disabled={!isEditing}
                      variant={isEditing ? "outlined" : "filled"}
                      InputProps={{ readOnly: !isEditing }}
                      error={!!errors.household_head_name}
                      helperText={errors.household_head_name}
                    />
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Action Buttons */}
          {isEditing && (
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                startIcon={<SaveIcon />}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </CardContent>
      </StyledCard>
    </LocalizationProvider>
  );
};

export default PersonalDetails;