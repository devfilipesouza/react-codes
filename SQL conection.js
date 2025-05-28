import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

// Abrir banco de dados
const db = SQLite.openDatabase(
  { name: 'todo.db', location: 'default' },
  () => console.log('Banco de dados aberto!'),
  (error) => console.error('Erro ao abrir banco:', error)
);

const App = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  // Criar tabela ao iniciar
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, completed INTEGER DEFAULT 0)',
        [],
        () => console.log('Tabela criada!'),
        (error) => console.error('Erro ao criar tabela:', error)
      );
    });
    loadTasks();
  }, []);

  // Carregar tarefas
  const loadTasks = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM tasks',
        [],
        (_, { rows }) => setTasks(rows._array),
        (error) => console.error('Erro ao carregar tarefas:', error)
      );
    });
  };

  // Adicionar tarefa
  const addTask = () => {
    if (task.trim() === '') return;
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO tasks (title, completed) VALUES (?, 0)',
        [task],
        () => {
          setTask('');
          loadTasks();
        },
        (error) => console.error('Erro ao adicionar tarefa:', error)
      );
    });
  };

  // Marcar como concluída
  const toggleTask = (id, completed) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE tasks SET completed = ? WHERE id = ?',
        [completed ? 0 : 1, id],
        () => loadTasks(),
        (error) => console.error('Erro ao atualizar tarefa:', error)
      );
    });
  };

  // Excluir tarefa
  const deleteTask = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM tasks WHERE id = ?',
        [id],
        () => loadTasks(),
        (error) => console.error('Erro ao excluir tarefa:', error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Digite uma tarefa"
        value={task}
        onChangeText={setTask}
      />
      <Button title="Adicionar Tarefa" onPress={addTask} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => toggleTask(item.id, item.completed)}>
              <Text style={item.completed ? styles.completedTask : styles.taskText}>
                {item.title}
              </Text>
            </TouchableOpacity>
            <Button title="Excluir" onPress={() => deleteTask(item.id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskText: {
    fontSize: 16,
  },
  completedTask: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: 'gray',
  },
});

export default App;
