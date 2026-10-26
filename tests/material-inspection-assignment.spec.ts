import { test, expect } from '@playwright/test';
import { MaterialInspectionAssignmentPage } from '../pages/material-inspection-assignment.page';
import {
  INSPECTION_TYPES,
  MATERIAL_INSPECTION_ASSIGNMENT_DATA,
} from './data/material-inspection-assignment.data';

test.describe('Material Inspection Assignment - CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  let assignment: MaterialInspectionAssignmentPage;

  test.beforeEach(async ({ page }) => {
    assignment = new MaterialInspectionAssignmentPage(page);
    await assignment.goto();
  });

  test('displays the assignment list and actions', async ({ page }) => {
    await expect(assignment.heading).toBeVisible();
    await expect(assignment.createButton).toBeVisible();
    await expect(assignment.resetButton).toBeVisible();
    await expect(assignment.goButton).toBeVisible();
    for (const column of ['Inspection Type', 'Material', 'Material Group', 'Description', 'Frequency', 'Unit']) {
      await expect(page.getByRole('columnheader', { name: new RegExp(column) }).first()).toBeVisible();
    }
  });

  test('filters by inspection type', async () => {
    for (const type of INSPECTION_TYPES) {
      await assignment.selectOption(assignment.inspectionTypeFilter, type);
      await assignment.goButton.click();
      await expect(assignment.dataRows).not.toHaveCount(0);
      for (let index = 0; index < await assignment.dataRows.count(); index++) {
        await expect(assignment.dataRows.nth(index)).toContainText(type);
      }
      await assignment.resetButton.click();
    }
  });

  test('creates an assignment', async () => {
    const data = MATERIAL_INSPECTION_ASSIGNMENT_DATA;
    try {
      await assignment.deleteIfExists(data);
      await assignment.create(data);
      await assignment.goto();
      await expect(assignment.rowOf(data)).toBeVisible();
    } finally {
      await assignment.deleteIfExists(data);
    }
  });

  test('does not continue without the required material key', async ({ page }) => {
    await assignment.createButton.click();
    await assignment.nextStepButton.click();
    await expect(page.getByRole('heading', { name: /Step 1 of 2/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Step 2 of 2/ })).toHaveCount(0);
  });

  test('views assignment details', async ({ page }) => {
    const data = MATERIAL_INSPECTION_ASSIGNMENT_DATA;
    try {
      await assignment.deleteIfExists(data);
      await assignment.create(data);
      await assignment.goto();
      await assignment.viewDetails(data);
      await expect(page.getByLabel('Frequency', { exact: true })).toHaveValue(data.frequency);
    } finally {
      await assignment.deleteIfExists(data);
    }
  });

  test('updates assignment frequency', async () => {
    const data = MATERIAL_INSPECTION_ASSIGNMENT_DATA;
    try {
      await assignment.deleteIfExists(data);
      await assignment.create(data);
      await assignment.goto();
      await assignment.openEdit(data);
      await assignment.fillFrequency({ frequency: '20', unit: data.unit });
      await assignment.save();
      await assignment.goto();
      await expect(assignment.rowOf(data)).toContainText('20');
    } finally {
      await assignment.deleteIfExists(data);
    }
  });

  test('deletes an assignment', async () => {
    const data = MATERIAL_INSPECTION_ASSIGNMENT_DATA;
    await assignment.deleteIfExists(data);
    await assignment.create(data);
    await assignment.goto();
    await assignment.delete(data);
    await expect(assignment.rowOf(data)).toHaveCount(0);
  });

  test('hides and shows filters', async () => {
    await expect(assignment.inspectionTypeFilter).toBeVisible();
    await assignment.hideFiltersButton.click();
    await expect(assignment.inspectionTypeFilter).toBeHidden();
    await assignment.showFiltersButton.click();
    await expect(assignment.inspectionTypeFilter).toBeVisible();
  });
});
