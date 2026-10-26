import type {
  InspectionType,
  MaterialInspectionAssignmentData,
} from '../../pages/material-inspection-assignment.page';

export const INSPECTION_TYPES: readonly InspectionType[] = [
  '03 - Inspection Process',
  '89 - Other Inspection',
];

export const MATERIAL_INSPECTION_ASSIGNMENT_DATA: MaterialInspectionAssignmentData = {
  inspectionType: '03 - Inspection Process',
  material: 'V-FIX800X400N',
  frequency: '10',
  unit: 'Each',
};

export const IMPORT_ASSIGNMENT_DATA: MaterialInspectionAssignmentData = {
  inspectionType: '03 - Inspection Process',
  material: 'V-FIX800X400N',
  frequency: '5',
  unit: 'Each',
};
