import { useReducer } from "react";
import { Task } from "../_components/types";
import { v7 as uuidv7 } from "uuid";

type State = {
  tasks: Task[];
};

type Action =
  | {
      type: "add";
      payload: { tasks: Omit<Task, "id">[] };
    }
  | {
      type: "delete";
      payload: { id: Task["id"] };
    }
  | {
      type: "set";
      payload: { id: Task["id"]; task: Omit<Partial<Task>, "id"> };
    }
  | {
      type: "upsert";
      payload: { tasks: Task[] };
    };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return {
        tasks: [
          ...state.tasks,
          ...action.payload.tasks.map((task) => ({ ...task, id: uuidv7() })),
        ],
      };
    case "upsert":
      return {
        tasks: action.payload.tasks.reduce(
          (acc, task) => {
            const index = acc.findIndex((t) => t.id === task.id);
            if (!task.id) {
              task.id = uuidv7();
            }
            if (index === -1) {
              return [...acc, { ...task }];
            }
            acc[index] = task;
            return acc;
          },
          [...state.tasks]
        ),
      };
    case "delete":
      return {
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      };
    case "set":
      return {
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.task }
            : task
        ),
      };
    default:
      return state;
  }
}

export const useTasks = (initialTasks: Task[]) => {
  const [state, dispatch] = useReducer(reducer, { tasks: initialTasks });

  const addTasks = (tasks: Omit<Task, "id">[]) => {
    dispatch({ type: "add", payload: { tasks } });
  };

  const upsertTasks = (tasks: Task[]) => {
    dispatch({ type: "upsert", payload: { tasks } });
  };

  const deleteTask = (id: Task["id"]) => {
    dispatch({ type: "delete", payload: { id } });
  };

  const setTask = (id: Task["id"], task: Omit<Partial<Task>, "id">) => {
    dispatch({ type: "set", payload: { id, task } });
  };

  return { tasks: state.tasks, addTasks, upsertTasks, deleteTask, setTask };
};
