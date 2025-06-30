import { useEffect, useState } from "react";
import { type TodoReadable, type CreateTodoRequest, Todo } from "../generated/client";
import { useAuth } from "../auth/Auth.ts";

const TodoPage = () => {
  const [todos, setTodos] = useState<TodoReadable[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState<CreateTodoRequest>({ title: "", description: "" });
  const { state, logout } = useAuth();

  const loadTodos = async () => {
    setLoading(true);
    try {
      const response = await Todo.getTodos();
      if (response.error) {
        console.log(response.error);
      } else if (response.data) {
        setTodos(response.data);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async () => {
    if (!newTodo.title?.trim()) return;
    try {
      const response = await Todo.createTodo({ body: newTodo });
      if (response.error) {
        console.log(response.error);
      } else if (response.data) {
        setTodos(prev => [...prev, response.data]);
        setNewTodo({ title: "", description: "" });
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setTodos(prev => prev.filter(todo => todo.id !== id));
      const response = await Todo.deleteTodo({ path: { id } });
      if (response.error) {
        console.log(response.error);
        loadTodos();
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      loadTodos();
    }
  };

  const toggleTodoStatus = async (todo: TodoReadable) => {
    const newStatus = todo.status === 0 ? 1 : 0;
    try {
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, status: newStatus } : t));
      const response = await Todo.updateTodo({
        path: { id: todo.id },
        body: {
          title: todo.title,
          description: todo.description,
          status: newStatus
        }
      });
      if (response.error) {
        console.log(response.error);
        loadTodos();
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
      loadTodos();
    }
  };

  useEffect(() => {
    if (state.isAuthenticated) {
      loadTodos();
    }
  }, [state.isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex flex-col space-y-1.5">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Your Todos</h2>
            <p className="text-sm text-muted-foreground">
              Manage your tasks and stay productive
            </p>
          </div>
        </div>

        <div className="p-6 pt-0">
          {/* Add new todo form */}
          <form
            className="flex flex-col sm:flex-row gap-3 mb-6"
            onSubmit={e => { e.preventDefault(); createTodo(); }}
          >
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTodo.title || ""}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
            />
            <input
              type="text"
              placeholder="Add a description (optional)"
              value={newTodo.description || ""}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
            />
            <button
              type="submit"
              disabled={!newTodo.title?.trim()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shrink-0"
            >
              Add Todo
            </button>
          </form>

          {todos.length > 0 ? (
            <div className="space-y-3">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className={"rounded-lg border p-4 transition-colors"}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox for completion */}
                    <div className="flex items-center mt-1">
                      <input
                        title="Toggle todo status"
                        type="checkbox"
                        checked={todo.status === 1}
                        onChange={() => toggleTodoStatus(todo)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    
                    {/* Todo content */}
                    <div className="flex-1 space-y-1">
                      <h3 className={`font-medium leading-none ${
                        todo.status === 1 ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={`text-sm ${
                          todo.status === 1 ? 'line-through text-muted-foreground/60' : 'text-muted-foreground'
                        }`}>
                          {todo.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(todo.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 transition-colors group"
                      title="Delete todo"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No todos yet. Create your first one above!</p>
            </div>
          )}
        </div>

        <div className="p-6 pt-0">
          <button
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
