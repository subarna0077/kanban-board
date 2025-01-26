import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initialData = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      { id: "task-1", content: "Task 1" },
      { id: "task-2", content: "Task 2" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [{ id: "task-3", content: "Task 3" }],
  },
  {
    id: "done",
    title: "Done",
    tasks: [{ id: "task-4", content: "Task 4" }],
  },
];

const App = () => {
  const [columns, setColumns] = useState(() => {
    const savedData = localStorage.getItem("kanbanData");
    return savedData ? JSON.parse(savedData) : initialData;
  });

  useEffect(() => {
    localStorage.setItem("kanbanData", JSON.stringify(columns));
  }, [columns]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumnIndex = columns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destinationColumnIndex = columns.findIndex(
      (col) => col.id === destination.droppableId
    );

    const sourceColumn = columns[sourceColumnIndex];
    const destinationColumn = columns[destinationColumnIndex];

    const sourceTasks = Array.from(sourceColumn.tasks);
    const [removedTask] = sourceTasks.splice(source.index, 1);

    if (sourceColumn.id === destinationColumn.id) {
      sourceTasks.splice(destination.index, 0, removedTask);
      const updatedColumn = { ...sourceColumn, tasks: sourceTasks };
      const updatedColumns = [...columns];
      updatedColumns[sourceColumnIndex] = updatedColumn;
      setColumns(updatedColumns);
    } else {
      const destinationTasks = Array.from(destinationColumn.tasks);
      destinationTasks.splice(destination.index, 0, removedTask);
      const updatedSourceColumn = { ...sourceColumn, tasks: sourceTasks };
      const updatedDestinationColumn = {
        ...destinationColumn,
        tasks: destinationTasks,
      };
      const updatedColumns = [...columns];
      updatedColumns[sourceColumnIndex] = updatedSourceColumn;
      updatedColumns[destinationColumnIndex] = updatedDestinationColumn;
      setColumns(updatedColumns);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="p-4 bg-gray-100 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">{column.title}</h2>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-2 bg-white shadow rounded-lg"
                        >
                          {task.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <button
              onClick={() => {
                const newTask = {
                  id: `task-${Date.now()}`,
                  content: `New Task ${Date.now()}`,
                };
                const updatedColumn = {
                  ...column,
                  tasks: [...column.tasks, newTask],
                };
                const updatedColumns = columns.map((col) =>
                  col.id === column.id ? updatedColumn : col
                );
                setColumns(updatedColumns);
              }}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg"
            >
              Add Task
            </button>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default App;
