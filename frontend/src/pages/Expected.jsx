import DataManagementPage from "./DataManagementPage";
import TasksPage from "./TasksPage";
function Expected() {
  return (
    <>
      <TasksPage
        tableName="activity_duration"
        showTableConfigFilter={false}
        showTablePagination={false}
      ></TasksPage>
    </>
  );
}

export default Expected;
