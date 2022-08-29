export type AnchorTodoList = {
  "version": "0.1.0",
  "name": "anchor_todo_list",
  "instructions": [
    {
      "name": "initTodoList",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addTodo",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "todo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "markCompleted",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "todo",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "todoCounter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "todo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "isCompleted",
            "type": "bool"
          }
        ]
      }
    }
  ]
};

export const IDL: AnchorTodoList = {
  "version": "0.1.0",
  "name": "anchor_todo_list",
  "instructions": [
    {
      "name": "initTodoList",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addTodo",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "todo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    },
    {
      "name": "markCompleted",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "todo",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "todoCounter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "todo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "isCompleted",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
