import React from 'react';
import useLanguage from '../hooks/useLanguage';

const TranslationExample = () => {
  const { t, currentLanguage } = useLanguage();
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">{t('tasks')}</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="font-medium mb-1">{t('taskName')}</label>
          <input 
            type="text" 
            className="border rounded p-2"
            placeholder={t('taskName')}
          />
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">{t('taskDescription')}</label>
          <textarea 
            className="border rounded p-2"
            placeholder={t('taskDescription')}
            rows={3}
          />
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">{t('taskStatus')}</label>
          <select className="border rounded p-2">
            <option value="todo">{t('statusTodo')}</option>
            <option value="inProgress">{t('statusInProgress')}</option>
            <option value="completed">{t('statusCompleted')}</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="font-medium mb-1">{t('taskPriority')}</label>
          <select className="border rounded p-2">
            <option value="low">{t('priorityLow')}</option>
            <option value="medium">{t('priorityMedium')}</option>
            <option value="high">{t('priorityHigh')}</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 rounded">{t('cancel')}</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">{t('save')}</button>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        {currentLanguage === 'ar' ? 'تم تعيين اللغة على العربية' : 'Language is set to English'}
      </div>
    </div>
  );
};

export default TranslationExample; 