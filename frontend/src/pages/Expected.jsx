import DataManagementPage from "./DataManagementPage";
import DataSection from "./DataSection";
function Expected() {
  return (
    <>
      <DataSection
        tableName="activity_duration"
        showTableConfigFilter={false}
        showTablePagination={true}
      ></DataSection>
    </>
  );
}

export default Expected;
