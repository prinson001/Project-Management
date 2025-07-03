import React, { useState, useEffect } from "react";
import { X, Save, Calendar } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "../axiosInstance";
import { useForm, Controller } from "react-hook-form";
import Datepicker from "react-tailwindcss-datepicker";

const ProjectSchedulePlanModal = ({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName,
  projectType,
  projectBudget 
}) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("B. Days");
  const [phases, setPhases] = useState([]);

  const isInternalSchedule = ["1", "4"].includes(projectType?.toString());

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      executionStartDate: null,
      executionDuration: "4",
      maintenanceDate: null,
      execution_duration_type: "weeks"
    }
  });

  const executionStartDate = watch("executionStartDate");
  const executionDuration = watch("executionDuration");
  const maintenanceDate = watch("maintenanceDate");
  const executionDurationType = watch("execution_duration_type");

  useEffect(() => {
    if (isOpen && projectId) {
      if (isInternalSchedule) {
        loadInternalSchedule();
      } else {
        loadExternalSchedule();
      }
    }
  }, [isOpen, projectId, isInternalSchedule]);

  const loadInternalSchedule = async () => {
    setLoading(true);
    try {
      // Load existing internal schedule
      const response = await axiosInstance.post(
        "/data-management/getInternalSchedulePlan",
        { projectId }
      );

      if (response.data.status === "success") {
        const scheduleResult = response.data.result;
        setScheduleData(scheduleResult);
        
        // Set form values
        if (response.data.execution_duration) {
          setValue("executionDuration", response.data.execution_duration.split(" ")[0]);
          setValue("execution_duration_type", response.data.execution_duration.split(" ")[1] || "weeks");
        }
        if (response.data.maintenance_date) {
          setValue("maintenanceDate", new Date(response.data.maintenance_date));
        }
      } else {
        // Initialize default internal schedule
        setScheduleData([
          {
            phase_id: 1,
            main_phase: "Planning",
            phase_name: "Prepare scope",
            duration_days: 28,
            start_date: null,
            end_date: null
          },
          {
            phase_id: 4,
            main_phase: "Execution", 
            phase_name: "Execute phase",
            duration_days: 28,
            start_date: null,
            end_date: null
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading internal schedule:", error);
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  const loadExternalSchedule = async () => {
    setLoading(true);
    try {
      // Load phases based on budget
      const phasesResponse = await axiosInstance.post(
        "/data-management/getSchedulePhases",
        { budget: parseFloat(projectBudget) || 0 }
      );

      if (phasesResponse.data.status === "success") {
        setPhases(phasesResponse.data.result);
      }

      // Load existing schedule
      const scheduleResponse = await axiosInstance.post(
        "/data-management/getSchedulePlan",
        { projectId }
      );

      if (scheduleResponse.data.status === "success") {
        setScheduleData(scheduleResponse.data.result.map(plan => ({
          phaseId: plan.phase_id,
          mainPhase: plan.main_phase,
          subPhase: plan.phase_name,
          duration: `${plan.duration_days} days`,
          durationDays: plan.duration_days,
          startDate: plan.start_date ? new Date(plan.start_date) : null,
          endDate: plan.end_date ? new Date(plan.end_date) : null
        })));
      } else if (phases.length > 0) {
        // Initialize default schedule from phases
        setScheduleData(phases.map(phase => ({
          phaseId: phase.id,
          mainPhase: phase.main_phase,
          subPhase: phase.phase_name,
          duration: `${phase.duration_days || 7} days`,
          durationDays: phase.duration_days || 7,
          startDate: null,
          endDate: null
        })));
      }
    } catch (error) {
      console.error("Error loading external schedule:", error);
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  const calculateDates = () => {
    if (!executionStartDate || scheduleData.length === 0) return;

    let currentDate = new Date(executionStartDate);
    const updatedSchedule = scheduleData.map(phase => {
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setDate(startDate.getDate() + (phase.duration_days || 7) - 1);
      
      currentDate = new Date(endDate);
      currentDate.setDate(currentDate.getDate() + 1);

      return {
        ...phase,
        startDate,
        endDate
      };
    });

    setScheduleData(updatedSchedule);
  };

  useEffect(() => {
    calculateDates();
  }, [executionStartDate]);

  const handleSave = async (formData) => {
    if (scheduleData.length === 0) {
      toast.error("No schedule data to save");
      return;
    }

    setSaving(true);
    try {
      if (isInternalSchedule) {
        // Save internal schedule
        const response = await axiosInstance.post(
          "/data-management/upsertInternalSchedulePlan",
          {
            projectId,
            schedule: scheduleData.map(phase => ({
              phaseId: phase.phase_id,
              durationDays: phase.duration_days,
              startDate: phase.start_date ? phase.start_date.toISOString().split('T')[0] : null,
              endDate: phase.end_date ? phase.end_date.toISOString().split('T')[0] : null
            })),
            executionDuration: `${executionDuration} ${executionDurationType}`,
            maintenanceDate: maintenanceDate ? maintenanceDate.toISOString().split('T')[0] : null
          }
        );

        if (response.data.status === "success") {
          toast.success("Internal schedule plan saved successfully!");
          onClose();
        } else {
          throw new Error(response.data.message || "Failed to save schedule");
        }
      } else {
        // Save external schedule
        const response = await axiosInstance.post(
          "/data-management/upsertSchedulePlan",
          {
            projectId,
            schedule: scheduleData.map(phase => ({
              phaseId: phase.phaseId,
              durationDays: phase.durationDays,
              startDate: phase.startDate ? phase.startDate.toISOString().split('T')[0] : null,
              endDate: phase.endDate ? phase.endDate.toISOString().split('T')[0] : null
            })),
            execution_duration: executionDuration,
            maintenance_duration: maintenanceDate ? maintenanceDate.toISOString().split('T')[0] : null,
            execution_start_date: executionStartDate ? executionStartDate.toISOString().split('T')[0] : null
          }
        );

        if (response.data.status === "success") {
          toast.success("Schedule plan saved successfully!");
          onClose();
        } else {
          throw new Error(response.data.message || "Failed to save schedule");
        }
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {isInternalSchedule ? "Internal" : "External"} Project Schedule Plan
            </h2>
            <p className="text-gray-600">Configure schedule for: {projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            {/* Execution Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Execution Start Date <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="executionStartDate"
                  control={control}
                  rules={{ required: "Execution start date is required" }}
                  render={({ field }) => (
                    <Datepicker
                      value={field.value ? { startDate: field.value, endDate: field.value } : null}
                      onChange={(newValue) => field.onChange(newValue?.startDate)}
                      useRange={false}
                      asSingle={true}
                      placeholder="Select start date"
                      inputClassName="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                />
                {errors.executionStartDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.executionStartDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Execution Duration <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Controller
                    name="executionDuration"
                    control={control}
                    rules={{ required: "Duration is required" }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="1"
                        placeholder="Duration"
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                  <Controller
                    name="execution_duration_type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="days">Days</option>
                      </select>
                    )}
                  />
                </div>
                {errors.executionDuration && (
                  <p className="text-red-500 text-sm mt-1">{errors.executionDuration.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Maintenance Date
                </label>
                <Controller
                  name="maintenanceDate"
                  control={control}
                  render={({ field }) => (
                    <Datepicker
                      value={field.value ? { startDate: field.value, endDate: field.value } : null}
                      onChange={(newValue) => field.onChange(newValue?.startDate)}
                      useRange={false}
                      asSingle={true}
                      placeholder="Select maintenance date"
                      inputClassName="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                />
              </div>
            </div>

            {/* Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Main Phase</th>
                    <th className="border p-3 text-left">Sub Phase</th>
                    <th className="border p-3 text-left">Duration</th>
                    <th className="border p-3 text-left">Start Date</th>
                    <th className="border p-3 text-left">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.map((phase, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-3 font-medium">
                        {phase.main_phase || phase.mainPhase}
                      </td>
                      <td className="border p-3">
                        {phase.phase_name || phase.subPhase}
                      </td>
                      <td className="border p-3">
                        {phase.duration_days ? `${phase.duration_days} days` : phase.duration}
                      </td>
                      <td className="border p-3">
                        {(phase.start_date || phase.startDate) ? 
                          new Date(phase.start_date || phase.startDate).toLocaleDateString() : 
                          "-"
                        }
                      </td>
                      <td className="border p-3">
                        {(phase.end_date || phase.endDate) ? 
                          new Date(phase.end_date || phase.endDate).toLocaleDateString() : 
                          "-"
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProjectSchedulePlanModal;
