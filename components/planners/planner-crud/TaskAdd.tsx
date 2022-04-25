import React, { useCallback, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { v4 as uuidv4 } from "uuid";

import TaskForm from "./task-form/TaskForm";
import PlannerModal from "../planner-modal/PlannerModal";
import DiscardModal from "../../ui/modal/modal-variation/DiscardModal";
import { NotifStatus } from "../../ui/Notification";
import { FormTaskObject, Task } from "../../../models/task-models/Task";
import { postTask } from "../../../lib/planners/tasks-api";
import useNotification from "../../../hooks/useNotification";
import { PlannerMode } from "../../../models/planner-models/PlannerMode";
import useTemplate from "../../../hooks/useTemplate";

interface Props {
    onClose: () => void;
    onAddTask: () => void;
    beginningPeriod: Date;
}

// Math.floor(Math.random() * myMax + 1) + myMin;

const TaskAdd: React.FC<Props> = (props) => {
    const { onClose, onAddTask, beginningPeriod } = props;
    const { user } = useUser();
    const userId = user ? user.sub : null;

    const { currentTemplate, plannerMode } = useTemplate();

    const { setNotification } = useNotification();
    const [showDiscardModal, setShowDiscardModal] = useState(false);

    // For popup model for cancel event.
    const [userHasEdit, setUserHasEdit] = useState(false);

    const taskAddHandler = async (newFormTask: FormTaskObject) => {
        console.log("from taskAddHandler!");
        // if (!userId || !plannerMode) {
        //     if (!userId) alert("User is not logged in!");
        //     if (!plannerMode) alert("PlannerMode is null!");
        //     return;
        // }
        if (!userId) {
            if (!userId) alert("User is not logged in!");
            // if (!plannerMode) alert("PlannerMode is null!");
            return;
        }

        const newTask: Task = {
            ...newFormTask,
            id: uuidv4(),
            plannerType: plannerMode || PlannerMode.WEEKLY,
            userId,
        };

        if (plannerMode === PlannerMode.TEMPLATE && currentTemplate) {
            newTask.templateId = currentTemplate.id;
        }

        console.log("newTask:", newTask);

        setNotification(NotifStatus.PENDING);
        const { isSuccess, insertedId } = await postTask(
            newTask,
            plannerMode || PlannerMode.WEEKLY,
        );
        console.log("isSuccess:", isSuccess);
        if (isSuccess) {
            setNotification(NotifStatus.SUCCESS);
        } else {
            setNotification(NotifStatus.ERROR);
        }

        if (insertedId) newTask.id = insertedId;
        onAddTask(); // call mutate
        onClose();
    };

    const closeHandler = useCallback(() => {
        if (userHasEdit) setShowDiscardModal(true);
        else onClose();
    }, [userHasEdit, onClose]);

    const userHasEditHandler = useCallback((hasEdit: boolean) => {
        setUserHasEdit(hasEdit);
    }, []);

    // console.log(`currentActiveTemplate:`, currentTemplate);

    return (
        <PlannerModal onClose={closeHandler} title={"Add New Task"}>
            {showDiscardModal && (
                <DiscardModal onAction={onClose} onClose={setShowDiscardModal.bind(null, false)} />
            )}
            <TaskForm
                onSubmit={taskAddHandler}
                beginningPeriod={beginningPeriod}
                onHasEdit={userHasEditHandler}
                userHasEdit={userHasEdit}
            />
        </PlannerModal>
    );
};

export default TaskAdd;
