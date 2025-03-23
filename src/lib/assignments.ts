
export interface Test {
  name: string;
  test: string;
  hint: string;
}

export interface Step {
  id: string;
  title: string;
  content: string;
  example?: string;
  hint?: string;
  starterCode?: string;
  solution?: string;
  tests?: Test[];
}

export interface Assignment {
  id: string;
  title: string;
  module: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  prerequisites: string[];
  steps: Step[];
}

export interface AssignmentsData {
  assignments: Assignment[];
}

// Mock data based on the provided JSON structure
export const assignmentsData: AssignmentsData = {
  assignments: [
    {
      id: "javascript-basics-variables",
      title: "JavaScript Basics: Variables",
      module: "JavaScript Fundamentals",
      difficulty: "Beginner",
      estimatedTime: "15 minutes",
      prerequisites: ["Introduction to Programming"],
      steps: [
        {
          id: "step-1",
          title: "Understanding Variables",
          content: "Variables are containers for storing data values. In JavaScript, you declare a variable using the `let`, `const`, or `var` keyword.\n\n- `let` is used when a variable's value might change\n- `const` is used for values that won't change (constants)\n- `var` is the older way to declare variables (pre-ES6)",
          example: "// Examples of variable declarations\nlet age = 25;\nconst PI = 3.14159;\nvar name = 'John';",
          hint: "Think of variables like labeled boxes that hold different types of data."
        },
        {
          id: "step-2",
          title: "Variable Assignment",
          content: "Once you declare a variable, you can assign and reassign values to it (unless it's a constant).",
          example: "let score = 0; // Initial value\nscore = 100; // New value assigned\n\n// This would cause an error\n// const MAX_SCORE = 100;\n// MAX_SCORE = 200; // Error! Can't reassign constants",
          hint: "Remember that `const` variables cannot be reassigned after declaration."
        },
        {
          id: "step-3",
          title: "Practice: Create Variables",
          content: "Now it's your turn! Create three variables:\n1. A `const` called `MAX_USERS` set to 50\n2. A `let` variable called `currentUsers` set to 34\n3. A `let` variable called `availableSpots` that calculates the difference between `MAX_USERS` and `currentUsers`",
          starterCode: "// Declare your variables below\n\n\n// Don't modify this line\nconsole.log(`Available spots: ${availableSpots}`);",
          solution: "// Declare your variables below\nconst MAX_USERS = 50;\nlet currentUsers = 34;\nlet availableSpots = MAX_USERS - currentUsers;\n\n// Don't modify this line\nconsole.log(`Available spots: ${availableSpots}`);",
          tests: [
            {
              name: "MAX_USERS is declared as constant",
              test: "typeof MAX_USERS !== 'undefined' && (function() { try { MAX_USERS = 100; return false; } catch(e) { return true; } })()",
              hint: "Make sure you declare MAX_USERS using the const keyword."
            },
            {
              name: "MAX_USERS has the correct value",
              test: "MAX_USERS === 50",
              hint: "MAX_USERS should be set to exactly 50."
            },
            {
              name: "currentUsers is declared with let",
              test: "typeof currentUsers !== 'undefined'",
              hint: "You need to declare the currentUsers variable."
            },
            {
              name: "availableSpots calculation is correct",
              test: "availableSpots === 16",
              hint: "Make sure availableSpots equals MAX_USERS minus currentUsers."
            }
          ]
        }
      ]
    },
    {
      id: "python-data-structures-lists",
      title: "Python Data Structures: Lists",
      module: "Python Fundamentals",
      difficulty: "Intermediate",
      estimatedTime: "20 minutes",
      prerequisites: ["Python Basics"],
      steps: [
        {
          id: "step-1",
          title: "Introduction to Python Lists",
          content: "Lists are one of the most versatile data structures in Python. A list is an ordered collection of items that can be of mixed types.\n\nLists are defined using square brackets `[]` with comma-separated values.",
          example: "# Creating lists\nempty_list = []\nnumbers = [1, 2, 3, 4, 5]\nmixed_list = [1, 'Hello', 3.14, True]\n\n# Accessing elements (indexing starts at 0)\nfirst_item = numbers[0]  # Gets 1\nlast_item = numbers[-1]   # Gets 5",
          hint: "Think of a list as a container that holds multiple items in a specific order."
        },
        {
          id: "step-2",
          title: "List Operations",
          content: "Python lists support various operations like adding, removing, and modifying elements.",
          example: "fruits = ['apple', 'banana', 'cherry']\n\n# Adding elements\nfruits.append('orange')  # Adds to the end\nfruits.insert(1, 'mango')  # Inserts at index 1\n\n# Removing elements\nfruits.remove('banana')  # Removes by value\npopped_fruit = fruits.pop()  # Removes and returns last item\ndel fruits[0]  # Removes by index",
          hint: "Remember that list operations like append() and remove() modify the original list."
        },
        {
          id: "step-3",
          title: "Practice: Working with Lists",
          content: "Time to practice! Complete the following tasks:\n1. Create a list called `students` with the names 'Alice', 'Bob', and 'Charlie'\n2. Add 'David' to the end of the list\n3. Insert 'Eve' at index 2\n4. Remove 'Bob' from the list\n5. Create a new variable `student_count` with the number of students in the list",
          starterCode: "# Create and modify your students list below\n\n\n# Calculate the number of students\n\n\n# Don't modify these lines\nprint(students)\nprint(f\"Total students: {student_count}\")",
          solution: "# Create and modify your students list below\nstudents = ['Alice', 'Bob', 'Charlie']\nstudents.append('David')\nstudents.insert(2, 'Eve')\nstudents.remove('Bob')\n\n# Calculate the number of students\nstudent_count = len(students)\n\n# Don't modify these lines\nprint(students)\nprint(f\"Total students: {student_count}\")",
          tests: [
            {
              name: "students list is created",
              test: "isinstance(students, list)",
              hint: "Make sure you create a list called 'students'."
            },
            {
              name: "List contains correct names",
              test: "set(students) == set(['Alice', 'Charlie', 'Eve', 'David'])",
              hint: "Your list should contain Alice, Charlie, Eve, and David after all operations."
            },
            {
              name: "Eve is at correct position",
              test: "students.index('Eve') == 1",
              hint: "After removing Bob, Eve should be at index 1."
            },
            {
              name: "student_count is calculated correctly",
              test: "student_count == 4",
              hint: "Make sure you use the len() function to count the students."
            }
          ]
        }
      ]
    }
  ]
};

// Function to get all assignments
export const getAssignments = (): Assignment[] => {
  return assignmentsData.assignments;
};

// Function to get an assignment by ID
export const getAssignmentById = (id: string): Assignment | undefined => {
  return assignmentsData.assignments.find((assignment) => assignment.id === id);
};

// Function to get a step by ID
export const getStepById = (assignmentId: string, stepId: string): Step | undefined => {
  const assignment = getAssignmentById(assignmentId);
  if (!assignment) return undefined;
  return assignment.steps.find((step) => step.id === stepId);
};

// User progress tracking
interface UserProgress {
  [assignmentId: string]: {
    completed: boolean;
    lastAccessed: string;
    steps: {
      [stepId: string]: {
        completed: boolean;
        code: string;
      };
    };
  };
}

// Get user progress from local storage
export const getUserProgress = (): UserProgress => {
  const storedProgress = localStorage.getItem("user-progress");
  if (!storedProgress) return {};
  return JSON.parse(storedProgress);
};

// Save user progress to local storage
export const saveUserProgress = (progress: UserProgress): void => {
  localStorage.setItem("user-progress", JSON.stringify(progress));
};

// Get user code for a specific step
export const getUserCode = (assignmentId: string, stepId: string): string | null => {
  const progress = getUserProgress();
  if (!progress[assignmentId] || !progress[assignmentId].steps[stepId]) {
    return null;
  }
  return progress[assignmentId].steps[stepId].code;
};

// Save user code for a specific step
export const saveUserCode = (assignmentId: string, stepId: string, code: string): void => {
  const progress = getUserProgress();
  if (!progress[assignmentId]) {
    progress[assignmentId] = {
      completed: false,
      lastAccessed: new Date().toISOString(),
      steps: {},
    };
  }
  
  progress[assignmentId].lastAccessed = new Date().toISOString();
  
  if (!progress[assignmentId].steps[stepId]) {
    progress[assignmentId].steps[stepId] = {
      completed: false,
      code: "",
    };
  }
  
  progress[assignmentId].steps[stepId].code = code;
  saveUserProgress(progress);
};

// Mark a step as completed
export const markStepCompleted = (assignmentId: string, stepId: string): void => {
  const progress = getUserProgress();
  if (!progress[assignmentId]) {
    progress[assignmentId] = {
      completed: false,
      lastAccessed: new Date().toISOString(),
      steps: {},
    };
  }
  
  if (!progress[assignmentId].steps[stepId]) {
    progress[assignmentId].steps[stepId] = {
      completed: false,
      code: "",
    };
  }
  
  progress[assignmentId].steps[stepId].completed = true;
  
  // Check if all steps are completed
  const assignment = getAssignmentById(assignmentId);
  if (assignment) {
    const allStepsCompleted = assignment.steps.every(
      (step) => progress[assignmentId].steps[step.id]?.completed
    );
    progress[assignmentId].completed = allStepsCompleted;
  }
  
  saveUserProgress(progress);
};

// Get modules from assignments
export const getModules = (): string[] => {
  const modules = new Set<string>();
  assignmentsData.assignments.forEach((assignment) => {
    modules.add(assignment.module);
  });
  return Array.from(modules);
};

// Get assignments by module
export const getAssignmentsByModule = (module: string): Assignment[] => {
  return assignmentsData.assignments.filter(
    (assignment) => assignment.module === module
  );
};
