export const Bus = new EventTarget();

export const Events = Object.freeze({
    PROJECT_LOAD: 'project:load',
    PROJECT_SUCCESS: 'project:success',
    PROJECT_CURRENT: 'project:current',
    PROJECT_DELETE: 'project:delete',
    PROJECT_SELECT: 'project:select',
    TASK_SUCCESS: 'task:success',
    LIST_CREATE: 'list:create',
    LIST_TOGGLE: 'list:toggle',
    LIST_DELETE: 'list:delete'
});