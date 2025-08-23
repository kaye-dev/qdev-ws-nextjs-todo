# Manual Testing Checklist for Simple Todo App

## Test Environment Setup

1. Start the development server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Open browser developer tools to check console for errors

## Requirement 1: Add New Tasks (要件1)

### 1.1 Task Addition via Button Click

- [ ] Enter text in input field
- [ ] Click "タスクを追加" button
- [ ] Verify task appears in list
- [ ] Verify input field is cleared after addition

### 1.2 Task Addition via Enter Key

- [ ] Enter text in input field
- [ ] Press Enter key
- [ ] Verify task appears in list
- [ ] Verify input field is cleared after addition

### 1.3 Empty Input Validation

- [ ] Leave input field empty
- [ ] Try to submit (button click or Enter)
- [ ] Verify error message appears: "タスクの内容を入力してください"
- [ ] Verify task is not added to list

### 1.4 Input Field Clearing

- [ ] Add a task successfully
- [ ] Verify input field is automatically cleared
- [ ] Verify character counter resets to "0/200"

## Requirement 2: Toggle Task Completion (要件2)

### 2.1 Mark Task as Complete

- [ ] Add a new task
- [ ] Click the checkbox next to the task
- [ ] Verify checkbox becomes checked
- [ ] Verify task text gets strikethrough style

### 2.2 Mark Task as Incomplete

- [ ] Have a completed task (with strikethrough)
- [ ] Click the checkbox next to the completed task
- [ ] Verify checkbox becomes unchecked
- [ ] Verify strikethrough style is removed

### 2.3 Visual Feedback

- [ ] Verify completed tasks have gray text color
- [ ] Verify incomplete tasks have normal text color
- [ ] Verify smooth transition animations

### 2.4 Immediate State Reflection

- [ ] Toggle task completion multiple times
- [ ] Verify each change is reflected immediately
- [ ] Check progress bar updates accordingly

## Requirement 3: Delete Tasks (要件3)

### 3.1 Delete Task

- [ ] Add several tasks
- [ ] Click delete button (trash icon) on one task
- [ ] Verify task is removed from list immediately

### 3.2 UI Update After Deletion

- [ ] Delete a task from middle of list
- [ ] Verify remaining tasks maintain their order
- [ ] Verify no visual glitches or layout shifts

### 3.3 Order Preservation

- [ ] Add tasks: "Task A", "Task B", "Task C"
- [ ] Delete "Task B"
- [ ] Verify "Task A" and "Task C" remain in correct order

## Requirement 4: View Task List (要件4)

### 4.1 Display All Tasks

- [ ] Add multiple tasks
- [ ] Verify all tasks are visible in the list
- [ ] Verify tasks show completion state, text, and delete button

### 4.2 Empty State Display

- [ ] Start with no tasks (or delete all tasks)
- [ ] Verify empty state message appears: "タスクがありません"
- [ ] Verify helpful instruction text is shown

### 4.3 Creation Order Display

- [ ] Add tasks in specific order: "First", "Second", "Third"
- [ ] Verify tasks appear in the same order they were added

### 4.4 Task Information Display

- [ ] Verify each task shows:
  - [ ] Checkbox for completion state
  - [ ] Task text content
  - [ ] Delete button (trash icon)

## Requirement 5: Responsive Design (要件5)

### 5.1 Mobile Layout

- [ ] Resize browser to mobile width (< 640px)
- [ ] Verify layout adapts appropriately
- [ ] Verify touch targets are at least 44px
- [ ] Test touch interactions on mobile device if available

### 5.2 Desktop Layout

- [ ] View on desktop screen (> 1024px)
- [ ] Verify layout uses available space effectively
- [ ] Verify hover effects work on interactive elements

### 5.3 Layout Adaptation

- [ ] Gradually resize browser window from mobile to desktop
- [ ] Verify smooth transitions between breakpoints
- [ ] Verify no horizontal scrolling occurs

### 5.4 Touch Device Optimization

- [ ] Test on touch device or simulate touch in dev tools
- [ ] Verify buttons and checkboxes are easy to tap
- [ ] Verify no accidental interactions occur

## Data Persistence Testing

### Local Storage Functionality

- [ ] Add several tasks
- [ ] Refresh the page
- [ ] Verify all tasks persist after refresh
- [ ] Toggle some task completion states
- [ ] Refresh page and verify states persist
- [ ] Delete some tasks
- [ ] Refresh page and verify deletions persist

### Storage Error Handling

- [ ] Open browser dev tools
- [ ] Disable local storage (if possible in your browser)
- [ ] Verify app still functions without crashing
- [ ] Check console for appropriate error messages

## Error Handling Testing

### Input Validation

- [ ] Try to add task with only whitespace
- [ ] Verify appropriate error message
- [ ] Try to add very long task (>200 characters)
- [ ] Verify character limit is enforced

### Duplicate Task Prevention

- [ ] Add a task: "Test Task"
- [ ] Try to add same task again: "Test Task"
- [ ] Verify duplicate prevention works
- [ ] Try with different casing: "test task"
- [ ] Verify case-insensitive duplicate detection

## Accessibility Testing

### Keyboard Navigation

- [ ] Use Tab key to navigate through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test Enter key for form submission
- [ ] Test Space key for checkbox toggling

### Screen Reader Support

- [ ] Use screen reader or browser accessibility tools
- [ ] Verify proper labels and descriptions
- [ ] Check ARIA attributes are present
- [ ] Verify status updates are announced

### Color and Contrast

- [ ] Verify sufficient color contrast for all text
- [ ] Test with high contrast mode if available
- [ ] Verify information isn't conveyed by color alone

## Performance Testing

### Loading Performance

- [ ] Check initial page load time
- [ ] Verify no unnecessary network requests
- [ ] Check for console errors or warnings

### Interaction Performance

- [ ] Add many tasks (20+)
- [ ] Verify interactions remain smooth
- [ ] Check for memory leaks in dev tools

## Dark Mode Testing

### Theme Switching

- [ ] Check system dark mode preference
- [ ] Verify app respects system theme
- [ ] Verify all colors work well in dark mode
- [ ] Check contrast ratios in dark mode

## Cross-Browser Testing

### Browser Compatibility

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if available)
- [ ] Test in Edge
- [ ] Verify consistent behavior across browsers

## Progress Tracking

### Task Counter

- [ ] Add tasks and verify counter updates
- [ ] Complete tasks and verify progress bar updates
- [ ] Delete tasks and verify counters adjust
- [ ] Verify percentage calculation is correct

### Visual Progress Indicator

- [ ] Add 4 tasks
- [ ] Complete 2 tasks
- [ ] Verify progress bar shows 50%
- [ ] Verify color coding (yellow for pending, green for completed)

## Final Integration Test

### Complete User Workflow

- [ ] Start with empty app
- [ ] Add 5 different tasks
- [ ] Complete 2 tasks
- [ ] Delete 1 completed task
- [ ] Delete 1 incomplete task
- [ ] Refresh page
- [ ] Verify final state is correct
- [ ] Verify all functionality still works

## Test Results Summary

Date: ___________
Tester: ___________

### Issues Found

- [ ] No issues found
- [ ] Minor issues (list below)
- [ ] Major issues (list below)

### Issue Details

_____________________
_____________________
_____________________

### Overall Assessment

- [ ] All requirements met
- [ ] Most requirements met with minor issues
- [ ] Some requirements not met
- [ ] Major functionality issues found
