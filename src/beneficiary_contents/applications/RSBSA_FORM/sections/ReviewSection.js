import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Agriculture as AgricultureIcon,
  Landscape as LandscapeIcon,
  Work as WorkIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Import database flow component
import DatabaseFlowInfo from '../components/DatabaseFlowInfo';

const ReviewSection = ({ formData, errors, onEdit }) => {
  const hasErrors = Object.keys(errors).length > 0;
  
  // Get user info for display
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatBoolean = (value) => {
    return value ? 'Yes' : 'No';
  };

  const formatEnum = (value) => {
    if (!value) return 'Not specified';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
            Review Your Information
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please review all information before submitting your RSBSA application
          </Typography>
        </Box>
      </Box>

      {/* Database Flow Information */}
      <DatabaseFlowInfo currentUser={currentUser} formData={formData} />

      {/* Validation Status */}
      {hasErrors ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Please Fix the Following Issues
          </Typography>
          <List dense>
            {Object.entries(errors).map(([field, error]) => (
              <ListItem key={field} sx={{ py: 0 }}>
                <ListItemIcon>
                  <WarningIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={error}
                  secondary={`Field: ${field.replace(/\./g, ' → ')}`}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            All Required Information Completed
          </Typography>
          <Typography variant="body2">
            Your form is ready for submission. Review the details below and submit when ready.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Personal Information Review */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(1)}
                  sx={{ color: 'inherit', borderColor: 'currentColor' }}
                >
                  Edit
                </Button>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Location:</strong> {formData.beneficiaryProfile.barangay}, {formData.beneficiaryProfile.municipality}, {formData.beneficiaryProfile.province}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Contact Number:</strong> {formData.beneficiaryProfile.contact_number || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Birth Date:</strong> {formatDate(formData.beneficiaryProfile.birth_date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Civil Status:</strong> {formatEnum(formData.beneficiaryProfile.civil_status)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Education:</strong> {formatEnum(formData.beneficiaryProfile.highest_education)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>PWD Status:</strong> {formatBoolean(formData.beneficiaryProfile.pwd)}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Farm Profile Review */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'success.light', color: 'success.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AgricultureIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Farm Profile
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(2)}
                  sx={{ color: 'inherit', borderColor: 'currentColor' }}
                >
                  Edit
                </Button>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                <strong>Primary Livelihood Category ID:</strong> {formData.farmProfile.livelihood_category_id || 'Not selected'}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Farm Parcels Review */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LandscapeIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Farm Parcels ({formData.farmParcels.length})
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(3)}
                  sx={{ color: 'inherit', borderColor: 'currentColor' }}
                >
                  Edit
                </Button>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {formData.farmParcels.length === 0 ? (
                <Typography variant="body2" color="error">
                  No farm parcels added. At least one parcel is required.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {formData.farmParcels.map((parcel, index) => (
                    <Grid item xs={12} key={index}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Parcel #{index + 1} {parcel.parcel_number && `- ${parcel.parcel_number}`}
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Location:</strong> {parcel.barangay || 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Area:</strong> {parcel.farm_area || 0} hectares
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Tenure:</strong> {formatEnum(parcel.tenure_type)}
                            </Typography>
                          </Grid>
                        </Grid>
                        {(parcel.is_ancestral_domain || parcel.is_agrarian_reform_beneficiary || parcel.is_organic_practitioner) && (
                          <Box sx={{ mt: 1 }}>
                            {parcel.is_ancestral_domain && <Chip label="Ancestral Domain" size="small" sx={{ mr: 1 }} />}
                            {parcel.is_agrarian_reform_beneficiary && <Chip label="Agrarian Reform" size="small" sx={{ mr: 1 }} />}
                            {parcel.is_organic_practitioner && <Chip label="Organic" size="small" />}
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      Total Area: {formData.farmParcels.reduce((sum, parcel) => sum + (parcel.farm_area || 0), 0).toFixed(2)} hectares
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Livelihood Details Review */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'info.light', color: 'info.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WorkIcon sx={{ mr: 2 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Livelihood Details
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(4)}
                  sx={{ color: 'inherit', borderColor: 'currentColor' }}
                >
                  Edit
                </Button>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Farmer Details */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Farmer Activities
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary={`Rice Production: ${formatBoolean(formData.livelihoodDetails?.farmer?.is_rice)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Corn Production: ${formatBoolean(formData.livelihoodDetails?.farmer?.is_corn)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Other Crops: ${formatBoolean(formData.livelihoodDetails?.farmer?.is_other_crops)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Livestock: ${formatBoolean(formData.livelihoodDetails?.farmer?.is_livestock)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Poultry: ${formatBoolean(formData.livelihoodDetails?.farmer?.is_poultry)}`} />
                    </ListItem>
                  </List>
                </Grid>

                {/* Fisherfolk Details */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Fishing Activities
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary={`Fish Capture: ${formatBoolean(formData.livelihoodDetails?.fisherfolk?.is_fish_capture)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Aquaculture: ${formatBoolean(formData.livelihoodDetails?.fisherfolk?.is_aquaculture)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Fish Processing: ${formatBoolean(formData.livelihoodDetails?.fisherfolk?.is_fish_processing)}`} />
                    </ListItem>
                  </List>
                </Grid>

                {/* Farmworker Details */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Farm Work Activities
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary={`Land Preparation: ${formatBoolean(formData.livelihoodDetails?.farmworker?.is_land_preparation)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Cultivation: ${formatBoolean(formData.livelihoodDetails?.farmworker?.is_cultivation)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Harvesting: ${formatBoolean(formData.livelihoodDetails?.farmworker?.is_harvesting)}`} />
                    </ListItem>
                  </List>
                </Grid>

                {/* Agri-Youth Details */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Agri-Youth Involvement
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary={`Agri-Youth: ${formatBoolean(formData.livelihoodDetails?.agriYouth?.is_agri_youth)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Farming Household: ${formatBoolean(formData.livelihoodDetails?.agriYouth?.is_part_of_farming_household)}`} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`Formal Course: ${formatBoolean(formData.livelihoodDetails?.agriYouth?.is_formal_agri_course)}`} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {/* Final Review Information */}
      <Card variant="outlined" sx={{ mt: 3, borderRadius: 2, backgroundColor: 'background.default' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Before You Submit
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Data Accuracy:</strong> Ensure all information is accurate and complete as this will be used for program eligibility.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Document Verification:</strong> You may be required to provide supporting documents for verification.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Application Status:</strong> You can track your application status after submission.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReviewSection;