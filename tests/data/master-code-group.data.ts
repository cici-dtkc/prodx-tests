import type {
  MasterCodeGroupData,
  CodeEntry,
} from '../../pages/master-code-group.page';

export const MASTER_CODE_GROUP_DATA: MasterCodeGroupData = {
  catalogType: '1 - Characteristic Attributes',
  codeGroup: 'TES03',
  shortText: 'Test Code Group',
  status: 'Being Created',
  longText: 'Created by automated test',
};

export const MASTER_CODE_GROUP_CODES: CodeEntry[] = [
  { code: '0001', shortTextForCode: 'Pass' },
  { code: '0002', shortTextForCode: 'Fail' },
];

// Giá trị ghi vào file Excel khi import — dùng code ngắn cho Catalog Type
export const IMPORT_CODE_GROUP_EXCEL_DATA = {
  'Catalog Type *': '1',
  'Code Group *': 'TES03',
  'Short Text': 'Test Code Group',
  'Status': 'Being Created',
} as const;

// Data dùng để verify sau khi import
export const IMPORT_CODE_GROUP_DATA: MasterCodeGroupData = {
  catalogType: '1 - Characteristic Attributes',
  codeGroup: 'TES03',
  shortText: 'Test Code Group',
  status: 'Being Created',
};
