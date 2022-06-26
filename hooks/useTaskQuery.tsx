import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { fetchAllTasks } from '../lib/planners/tasks-api';
import { callRecurringItemUpdate } from '../lib/recurring';
import { PlannerTask, Task } from '../models/task-models/Task';
import { processTasks } from '../utilities/tasks-utils/task-util';

const useTaskQuery = (initialAllTasks?: Task[]) => {
    const queryClient = useQueryClient();

    const { data: allTasksData, error: allTasksError } = useQuery('all-tasks', fetchAllTasks, {
        initialData: initialAllTasks ? { tasks: initialAllTasks } : undefined,
    });

    if (allTasksError) console.error('All tasks fetching error!', allTasksError);
    let allTasks: Task[] = useMemo(
        () => (allTasksData ? allTasksData.tasks : []),
        [allTasksData],
    );

    const invalidateAllTasks = () => queryClient.invalidateQueries('all-tasks');

    const processedTasks: PlannerTask[] = useMemo(() => {
        return processTasks(allTasks);
    }, [allTasks]);

    useEffect(() => {
        callRecurringItemUpdate().then(({ isSuccess, message }) =>
            console.log(`success: ${isSuccess}, ${message}`),
        );
    }, []);

    return {
        allTasks: processedTasks,
        invalidateAllTasks,
    };
};

export default useTaskQuery;
