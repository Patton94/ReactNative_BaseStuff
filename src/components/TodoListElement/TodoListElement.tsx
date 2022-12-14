import crashlytics from "@react-native-firebase/crashlytics";
import firestore from "@react-native-firebase/firestore";
import React, { useMemo } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";

import colors from "../../constants/colors";
import useUser from "../../hooks/useUser";
import type { TodoListElementProps } from "../../types/components";
import {
  logOpenModal,
  logDeleteTodo,
  logFinishTodo,
} from "../../utils/analytics";
import CustomButton from "../CustomButton/CustomButton";

const TodoListElement = ({
  navigation,
  title,
  description,
  isImportant,
  isDone,
  id,
}: TodoListElementProps) => {
  const { user } = useUser();

  const openEditModal = () => {
    navigation.navigate("EditTodoModal", {
      title,
      description,
      isImportant,
      id,
    });
    logOpenModal("editTodo");
  };

  const deleteTodo = async () => {
    await firestore()
      .collection("Todos")
      .doc(id)
      .delete()
      .then(() => {
        Alert.alert("Todo deleted!");
        logDeleteTodo();
      })
      .catch((error) => {
        Alert.alert("Something went wrong");
        crashlytics().recordError(error);
      });
  };

  const moreInfo = () => {
    navigation.push("TodoItem", {
      title,
      description,
      isImportant,
      isDone,
    });
  };

  const markAsDone = async () => {
    await firestore()
      .collection("Todos")
      .doc(id)
      .update({
        isDone: true,
      })
      .then(() => {
        Alert.alert("Todo finished!");
        logFinishTodo();
      })
      .catch((error) => {
        Alert.alert("Something went wrong");
        crashlytics().recordError(error);
      });
  };

  const statusText = useMemo(() => {
    let text = "In progress ...";

    if (isDone) {
      text = "Done";
    } else if (isImportant) {
      text = "In progress ... IMPORTANT";
    }

    return text;
  }, [isDone, isImportant]);

  return (
    <View
      style={[
        styles.todo,
        isImportant && styles.todoImportant,
        isDone && styles.todoDone,
      ]}
    >
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <View style={styles.statusSection}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>
      <View style={styles.buttonsSection}>
        <CustomButton
          onPress={openEditModal}
          width={70}
          height={50}
          text="Edit"
          backgroundColor={colors.customButton.background.edit}
          disabled={isDone || !user.isAdmin}
        />
        <CustomButton
          onPress={deleteTodo}
          width={70}
          height={50}
          text="Delete"
          backgroundColor={colors.customButton.background.delete}
          disabled={!user.isAdmin}
        />
        <CustomButton
          onPress={moreInfo}
          width={70}
          height={50}
          text="More"
          backgroundColor={colors.customButton.background.more}
        />
        <CustomButton
          onPress={markAsDone}
          width={70}
          height={50}
          text="Done"
          backgroundColor={colors.customButton.background.done}
          disabled={isDone || !user.isAdmin}
        />
      </View>
    </View>
  );
};

export default TodoListElement;

const styles = StyleSheet.create({
  todo: {
    width: 360,
    height: 130,
    marginTop: 10,
    borderRadius: 6,
    paddingBottom: 8,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "grey",
  },
  todoImportant: {
    backgroundColor: colors.todoImportant,
  },
  todoDone: {
    backgroundColor: colors.todoDone,
  },
  titleSection: {
    flexBasis: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  statusSection: {
    flexBasis: 20,
  },
  statusText: {
    fontSize: 14,
    textAlign: "center",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
  },

  buttonsSection: {
    flexBasis: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
});
