import { NextPage } from "next";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";

import { getTasksFromPage } from "../../../utilities/mongodb-util/pages-util";
import { TaskCollection } from "../../../utilities/mongodb-util/mongodb-constant";
import { Task } from "../../../models/task-models/Task";
import WeeklyPlannerMain from "../../../components/planners/weekly-planner/WeeklyPlanner";
import LoadingSpinner from "../../../components/ui/design-elements/LoadingSpinner";
import { convertToTasks } from "../../../utilities/tasks-utils/task-util";
import { useQuery, useQueryClient } from "react-query";

interface Props {
    initialTasks: Task[];
}

const API_DOMIN = "/api/planners";
const collection = TaskCollection.WEEKLY_TASKS;

async function getTasks() {
    return fetch(`${API_DOMIN}?collection=${collection}`).then((res) => res.json());
}

const WeeklyPlanner: NextPage<Props> = (props) => {
    const { initialTasks } = props;
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery("tasks", getTasks, {
        initialData: { tasks: initialTasks },
    });

    const invalidateData = () => {
        queryClient.invalidateQueries("tasks");
    };

    if (error) console.error(error);

    let tasks = [];
    if (data) tasks = data.tasks;

    return (
        <div>
            <Head>
                <title>Weekly Task Planner</title>
                <meta
                    name='description'
                    content='Weekly task planner for users to manage and allocate their tasks'
                />
            </Head>
            {isLoading && (
                <div className='flex justify-center items-center mt-6'>
                    <LoadingSpinner />
                </div>
            )}
            {data && tasks && <WeeklyPlannerMain weeklyTasks={tasks} onMutate={invalidateData} />}
        </div>
    );
};

export default WeeklyPlanner;

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
    async getServerSideProps(context) {
        const { req, res } = context;
        const session = getSession(req, res);
        if (!session)
            return {
                redirect: {
                    destination: "/login",
                    permanent: false,
                },
            };

        const userId = session.user.sub;

        const data = await getTasksFromPage(TaskCollection.WEEKLY_TASKS, userId);
        const userTasks = convertToTasks(data);
        console.log("From server");
        console.log(userTasks);

        return {
            props: {
                initialTasks: userTasks,
            },
        };
    },
});
