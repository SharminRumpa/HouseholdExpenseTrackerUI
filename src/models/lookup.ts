// Matches DropdownItemDto from the API — used for Income Categories,
// Income Sources, Expense Categories, and Roles.
export interface DropdownItem {
  id: number;
  name: string;
}

// Matches ExpenseSubCategoryDropdownDto — carries its parent category id
// so the UI can filter sub-categories once a category is selected.
export interface ExpenseSubCategoryDropdown {
  id: number;
  name: string;
  expenseCategoryId: number;
}

export interface ResponseDto {
  success: boolean;
  message: string;
  data?: any;
}

export const MONTH_NAMES: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
