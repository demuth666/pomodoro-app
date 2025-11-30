import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import kebabIcon from '../assets/icons/kebab.png';
import {taskService} from '../services/task.service';
import type { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface TaskListProps {
  onTaskSelect: (task: Task) => void;
  activeTask?: string;
  onTaskUpdate?: () => void;
}

export default function TaskList({ onTaskSelect, activeTask, onTaskUpdate }: TaskListProps) {
  const {isAuthenticated} = useAuth();
  const [guestTasks, setGuestTasks] = useLocalStorage<Task[]>("guestTasks", []);
  const [apiTasks, setApiTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);
   const tasks = isAuthenticated ? apiTasks : guestTasks;

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskService.getTasks();
      setApiTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    if (isAuthenticated){
        setApiTasks(items);
    } else {
        setGuestTasks(items);
    }
  };

const toggleTask = async (id: string, currentStatus: boolean) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, is_completed: !currentStatus } : task
    );
   if (isAuthenticated) {
     setApiTasks(updatedTasks);

    try {
      await taskService.updateTask(id, {
        is_completed: !currentStatus
      });
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error("Gagal update status", error);
      fetchTasks();
    }
   } else {
    setGuestTasks(updatedTasks);
   }
  };

 const addTask = async () => {
    const tempId = `new-${Date.now()}`;

const newTask: Task = {
    id: tempId,
    task: "",
    is_completed: false,
  };

   if (isAuthenticated) {
     setApiTasks([...apiTasks, newTask]);
   } else {
      setGuestTasks([...guestTasks, newTask]);
   }

   startEditing(newTask);
   setEditText("");
 }

 const deleteTask = async (id: string) => {
    if (isAuthenticated) {
      setApiTasks(apiTasks.filter(t => t.id !== id));
      try {
        await taskService.deleteTask(id);
        if (onTaskUpdate) onTaskUpdate();
      } catch (e) {
        fetchTasks();
      }
    } else {
      setGuestTasks(guestTasks.filter(t => t.id !== id));
    }
    setActiveMenuTaskId(null);
 }

  const deleteFinishedTasks = async () => {
    const currentList = isAuthenticated ? apiTasks : guestTasks;
    const completedTasks = currentList.filter(t => t.is_completed);

    if (completedTasks.length === 0) {
        setShowMenu(false);
        return;
    }

    if (isAuthenticated) {
        const idsToDelete = completedTasks.map(t => t.id);
        setApiTasks(prev => prev.filter(t => !t.is_completed));

        try {
            await taskService.bulkDeleteTasks(idsToDelete);
            if (onTaskUpdate) onTaskUpdate();
        } catch (error) {
            console.error("Gagal menghapus task", error);
            fetchTasks();
        }
    } else {
        setGuestTasks(prev => prev.filter(t => !t.is_completed));
    }

    setShowMenu(false);
};

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.task);
    setActiveMenuTaskId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const text = editText.trim();
    const isNewTask = String(editingId).startsWith("new-");

    if (text === "") {
        if (isAuthenticated) {
        setApiTasks(prev => prev.filter(t => t.id !== editingId));
      } else {
        setGuestTasks(prev => prev.filter(t => t.id !== editingId));
      }
    } else {
        const updateList = (list: Task[]) =>
            list.map(t => t.id === editingId ? { ...t, task: text } : t);

        if (isAuthenticated) {
            setApiTasks(updateList(apiTasks));

           try {
                if (isNewTask) {
                    const response = await taskService.createTask({ task: text });
                    const realTask = response.data;
                    setApiTasks(prev =>
                        prev.map(t => t.id === editingId ? realTask : t)
                    );
                } else {
                    await taskService.updateTask(editingId, { task: text });
                }
                if (onTaskUpdate) onTaskUpdate();
            } catch (error) {
                console.error("Gagal simpan", error);
            }
        } else {
            setGuestTasks(updateList(guestTasks));
        }
    }

    setEditingId(null);
    setEditText("");
    }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuTaskId(null);
    if (activeMenuTaskId !== null) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeMenuTaskId]);

  return (
    <div className="bg-dark-card rounded-card p-4 sm:p-6 relative h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 relative">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-6 h-6 rounded-full bg-dark-gray flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <img src={kebabIcon} alt="More options" className="w-3 h-3 object-contain" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-gray rounded-lg shadow-lg z-20 border border-gray-700 overflow-hidden">
              <button
                onClick={deleteFinishedTasks}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-pomodoro-red hover:text-white transition-colors"
              >
                Delete finished tasks
              </button>
            </div>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              className="space-y-3 flex-1"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tasks.map((task, index) => {
                const isActive = activeTask === task.task;
                return (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          flex items-center space-x-3 group p-2 rounded-lg transition-colors -mx-2 relative
                          ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                        `}
                      >
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                          </svg>
                        </div>



                        {/* Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id, task.is_completed);
                          }}
                          className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
                            ${
                              task.is_completed
                                ? 'bg-pomodoro-red border-pomodoro-red'
                                : 'border-gray-500 hover:border-gray-400'
                            }
                          `}
                        >
                          {task.is_completed && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        {/* Task Text */}
                        {editingId === task.id ? (
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-transparent text-sm text-white border-b border-pomodoro-red focus:outline-none min-w-0"
                            autoFocus
                          />
                        ) : (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskSelect(task);
                            }}
                            className={`text-sm flex-1 cursor-pointer truncate ${
                              task.is_completed ? 'text-gray-500 line-through' : 'text-gray-300'
                            }`}
                            title="Click to start focus"
                          >
                            {task.task || 'Empty task'}
                          </span>
                        )}

                        {/* Kebab Menu Button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuTaskId(activeMenuTaskId === task.id ? null : task.id);
                            }}
                            className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuTaskId === task.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-dark-gray rounded-lg shadow-xl z-50 border border-gray-700 overflow-hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(task);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors flex items-center space-x-2"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task.id);
                                  localStorage.removeItem('currentTask');
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-pomodoro-red hover:text-white transition-colors flex items-center space-x-2"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {!editingId?.startsWith('new-') && (
        <button
          onClick={addTask}
          className="mt-4 w-full border border-dashed border-dark-gray/80 rounded-lg py-2 text-sm text-gray-400 hover:text-white hover:border-pomodoro-red transition-colors"
        >
          + Add new task
        </button>
      )}
    </div>
  );
}
