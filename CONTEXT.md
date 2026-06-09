# Todo by AI

Todo by AI helps people decide, organize, and complete their intended work.

## Language

**Task**:
A discrete piece of work a person intends to complete.
_Avoid_: Todo

**Title**:
The required short text that identifies a Task in Task lists.
_Avoid_: Name, Summary

**Note**:
Optional longer text that gives additional context for a Task.
_Avoid_: Description

**Created Date**:
The date and time when a Task was created. Created Date is not editable.
_Avoid_: Created At

**Modified Date**:
The date and time when a Task was last changed. Modified Date changes when the Title, Note, Due Date, or Task State changes.
_Avoid_: Updated At

**Due Date**:
An optional date by which the User intends to complete a Task.
_Avoid_: Deadline

**Past Due**:
A display condition for a Task whose Due Date has passed. Past Due is not a Task State.
_Avoid_: Overdue

**Due Today**:
A display condition for a Task whose Due Date is today. Due Today is not a Task State.
_Avoid_: Today

**Task Filter**:
A Main View choice that determines which Tasks are shown. The default Task Filter is All; other Task Filters include Past Due and Due Today.
_Avoid_: View Mode

**Task Sort**:
A Task surface choice that determines the order of shown Tasks. Task Sort options include Newest, Oldest, Recently Modified, and By Due Date.
_Avoid_: Ordering

**Newest**:
A Task Sort that places Tasks with the Created Date closest to now first.
_Avoid_: Latest

**Oldest**:
A Task Sort that places Tasks with the Created Date farthest from now first.
_Avoid_: Earliest

**Recently Modified**:
A Task Sort that places Tasks with the Modified Date closest to now first.
_Avoid_: Recently Updated

**By Due Date**:
A Task Sort that places Tasks with Due Dates closest to now first, followed by Tasks without Due Dates ordered by Created Date closest to now first.
_Avoid_: Due Date Sort

**Task State**:
The progress expectation for a Task. A Task State is Active, Completed, or Archived; a User can move a Task from Active to Completed or Archived, from Completed to Active or Archived, and from Archived to Active.
_Avoid_: Status

**Active**:
A Task State meaning further progress is expected. Newly created Tasks are Active by default.
_Avoid_: Open

**Completed**:
A Task State meaning no further progress is expected.
_Avoid_: Done

**Archived**:
A Task State meaning no further progress is expected and the User does not expect to see the Task in the main view.
_Avoid_: Hidden

**Main View**:
The User's primary Task surface. Active Tasks are shown prominently, and Completed Tasks can be shown or hidden there by the User in a Completed section.
_Avoid_: Home, Dashboard

**Completed Section**:
An optional Main View area for Completed Tasks. Main View Task Filters determine which Completed Tasks appear there, and Tasks in the Completed Section are always ordered by Recently Modified.
_Avoid_: Done List

**Archived View**:
A separate Task surface for Archived Tasks.
_Avoid_: Hidden Tasks

**Delete**:
A confirmed, non-recoverable action that removes a Task from the User's accessible Tasks.
_Avoid_: Remove

**User**:
A person who can create Tasks and owns the Tasks they create. By default, only the owning User can view, modify, or delete a Task.
_Avoid_: Account
