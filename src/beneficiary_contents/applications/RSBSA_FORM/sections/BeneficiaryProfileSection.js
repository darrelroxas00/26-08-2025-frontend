import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  FormHelperText,
  Chip
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

const BeneficiaryProfileSection = ({ formData, errors, updateField }) => {
  // Options based on database enum values
  const civilStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
    { value: 'divorced', label: 'Divorced' }
  ];

  const educationOptions = [
    { value: 'None', label: 'None' },
    { value: 'Pre-school', label: 'Pre-school' },
    { value: 'Elementary', label: 'Elementary' },
    { value: 'Junior High School', label: 'Junior High School' },
    { value: 'Senior High School', label: 'Senior High School' },
    { value: 'Vocational', label: 'Vocational' },
    { value: 'College', label: 'College' },
    { value: 'Post Graduate', label: 'Post Graduate' }
  ];

  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const sexOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  // Name extension options (common Filipino name suffixes)
  const nameExtensionOptions = [
    { value: '', label: 'None' },
    { value: 'Jr.', label: 'Jr.' },
    { value: 'Sr.', label: 'Sr.' },
    { value: 'II', label: 'II' },
    { value: 'III', label: 'III' },
    { value: 'IV', label: 'IV' },
    { value: 'V', label: 'V' }
  ];

  const barangayOptions = [
    'Bagocboc', 'Barra', 'Bonbon', 'Buruanga', 'Cabadiangan', 'Camaman-an',
    'Gotokan', 'Igpit', 'Limbaybay', 'Lower Olave', 'Lumbia', 'Malitbog',
    'Mapayag', 'Napaliran', 'Opol Poblacion', 'Patag', 'Pontod', 'San Vicente',
    'Tingalan', 'Taboc', 'Talakag', 'Upper Olave'
  ];

  const handleFieldChange = (field, value) => {
    updateField('beneficiaryProfile', field, value);
  };

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PersonIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
            Personal Information
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please provide your personal details as they appear in your valid IDs
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Full Name Card */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                Full Name
                <Chip label="From User Profile" color="info" size="small" sx={{ ml: 2 }} />
                <Chip label="Read-Only" color="warning" size="small" sx={{ ml: 1 }} />
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    value={formData.first_name || ''}
                    placeholder="First name from user profile"
                    error={!!errors['beneficiaryProfile.first_name']}
                    helperText="This information comes from your user profile and cannot be edited here"
                    disabled
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    value={formData.middle_name || ''}
                    placeholder="Middle name from user profile"
                    helperText="This information comes from your user profile and cannot be edited here"
                    disabled
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    value={formData.last_name || ''}
                    placeholder="Last name from user profile"
                    error={!!errors['beneficiaryProfile.last_name']}
                    helperText="This information comes from your user profile and cannot be edited here"
                    disabled
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled>
                    <InputLabel>Name Extension</InputLabel>
                    <Select
                      value={formData.name_extension || ''}
                      label="Name Extension"
                      disabled
                    >
                      {nameExtensionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>This information comes from your user profile and cannot be edited here</FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Basic Information Card */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                Basic Information
                <Chip label="Required" color="error" size="small" sx={{ ml: 2 }} />
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* Location Information */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors['beneficiaryProfile.barangay']}>
                    <InputLabel>Barangay *</InputLabel>
                    <Select
                      value={formData.barangay || ''}
                      onChange={(e) => handleFieldChange('barangay', e.target.value)}
                      label="Barangay *"  
                    >
                      {barangayOptions.map((barangay) => (
                        <MenuItem key={barangay} value={barangay}>
                          {barangay}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors['beneficiaryProfile.barangay'] && (
                      <FormHelperText>{errors['beneficiaryProfile.barangay']}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Municipality"
                    value={formData.municipality || 'Opol'}
                    disabled
                    helperText="Default: Opol"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Province"
                    value={formData.province || 'Misamis Oriental'}
                    disabled
                    helperText="Default: Misamis Oriental"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Region"
                    value={formData.region || 'Region X (Northern Mindanao)'}
                    disabled
                    helperText="Default: Region X"
                  />
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Number *"
                    value={formData.contact_number || ''}
                    onChange={(e) => handleFieldChange('contact_number', e.target.value)}
                    placeholder="Enter your contact number"
                    error={!!errors['beneficiaryProfile.contact_number']}
                    helperText={errors['beneficiaryProfile.contact_number'] || 'Primary contact number'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Number"
                    value={formData.emergency_contact_number || ''}
                    onChange={(e) => handleFieldChange('emergency_contact_number', e.target.value)}
                    placeholder="Emergency contact number"
                    helperText="Optional: Alternative contact number"
                  />
                </Grid>

                {/* Personal Details */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Birth Date *"
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors['beneficiaryProfile.birth_date']}
                    helperText={errors['beneficiaryProfile.birth_date'] || 'Your date of birth'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Place of Birth"
                    value={formData.place_of_birth || ''}
                    onChange={(e) => handleFieldChange('place_of_birth', e.target.value)}
                    placeholder="City/Municipality of birth"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors['beneficiaryProfile.sex']}>
                    <InputLabel>Sex *</InputLabel>
                    <Select
                      value={formData.sex || ''}
                      onChange={(e) => handleFieldChange('sex', e.target.value)}
                      label="Sex *"
                    >
                      {sexOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors['beneficiaryProfile.sex'] && (
                      <FormHelperText>{errors['beneficiaryProfile.sex']}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors['beneficiaryProfile.civil_status']}>
                    <InputLabel>Civil Status *</InputLabel>
                    <Select
                      value={formData.civil_status || ''}
                      onChange={(e) => handleFieldChange('civil_status', e.target.value)}
                      label="Civil Status *"
                    >
                      {civilStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors['beneficiaryProfile.civil_status'] && (
                      <FormHelperText>{errors['beneficiaryProfile.civil_status']}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {formData.civil_status === 'married' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name of Spouse"
                      value={formData.name_of_spouse || ''}
                      onChange={(e) => handleFieldChange('name_of_spouse', e.target.value)}
                      placeholder="Enter spouse's full name"
                    />
                  </Grid>
                )}

                {/* Education and Demographics */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Highest Education</InputLabel>
                    <Select
                      value={formData.highest_education || ''}
                      onChange={(e) => handleFieldChange('highest_education', e.target.value)}
                      label="Highest Education"
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
                    value={formData.religion || ''}
                    onChange={(e) => handleFieldChange('religion', e.target.value)}
                    placeholder="Enter your religion"
                  />
                </Grid>

                {/* Special Categories */}
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_pwd || false}
                        onChange={(e) => handleFieldChange('is_pwd', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Person with Disability (PWD)"
                  />
                </Grid>

                {/* Government ID Information */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Has Government ID</InputLabel>
                    <Select
                      value={formData.has_government_id || 'no'}
                      onChange={(e) => handleFieldChange('has_government_id', e.target.value)}
                      label="Has Government ID"
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
                      <TextField
                        fullWidth
                        label="Government ID Type"
                        value={formData.gov_id_type || ''}
                        onChange={(e) => handleFieldChange('gov_id_type', e.target.value)}
                        placeholder="e.g., Driver's License, PhilID, Passport"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Government ID Number"
                        value={formData.gov_id_number || ''}
                        onChange={(e) => handleFieldChange('gov_id_number', e.target.value)}
                        placeholder="Enter ID number"
                      />
                    </Grid>
                  </>
                )}

                {/* Association Membership */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Member of Association</InputLabel>
                    <Select
                      value={formData.is_association_member || 'no'}
                      onChange={(e) => handleFieldChange('is_association_member', e.target.value)}
                      label="Member of Association"
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
                      label="Association Name"
                      value={formData.association_name || ''}
                      onChange={(e) => handleFieldChange('association_name', e.target.value)}
                      placeholder="Enter association name"
                    />
                  </Grid>
                )}

                {/* Family Information */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mother's Maiden Name"
                    value={formData.mothers_maiden_name || ''}
                    onChange={(e) => handleFieldChange('mothers_maiden_name', e.target.value)}
                    placeholder="Enter mother's maiden name"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_household_head || false}
                        onChange={(e) => handleFieldChange('is_household_head', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Head of Household"
                  />
                </Grid>

                {!formData.is_household_head && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Household Head Name"
                      value={formData.household_head_name || ''}
                      onChange={(e) => handleFieldChange('household_head_name', e.target.value)}
                      placeholder="Enter household head name"
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BeneficiaryProfileSection;