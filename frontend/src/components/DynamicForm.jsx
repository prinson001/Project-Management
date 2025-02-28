import React from "react";
import { useForm } from "react-hook-form";

const DynamicForm = ({ title, fields, onSubmit }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="max-w-3xl bg-white p-6 rounded-lg shadow-lg w-full">
                {/* Title Left-Aligned */}
                <h2 className="text-xl font-semibold mb-4">{title}</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
                    {fields.map(({ name, label, type, required, className, options }, index) => (
                        <div key={index} className={`w-full ${className || ""}`}>
                            <label className="block text-sm font-medium">{label}</label>
                            {type === "select" ? (
                                <select
                                    {...register(name, { required })}
                                    className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select</option>
                                    {options.map((option, i) => (
                                        <option key={i} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={type}
                                    {...register(name, { required })}
                                    className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                            {errors[name] && <span className="text-red-500 text-sm">{label} is required</span>}
                        </div>
                    ))}

                    {/* Submit Button (Centered) */}
                    <div className="col-span-2 flex justify-center mt-4">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DynamicForm;
