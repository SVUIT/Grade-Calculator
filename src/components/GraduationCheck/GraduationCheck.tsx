import { useState } from 'react';
import { checkGraduationEligibility } from '../../config/appwrite';

export const GraduationCheck = () => {
  const [showForm, setShowForm] = useState(false);
  const [result, setResult] = useState<{ eligible: boolean; reasons: string[] } | null>(null);
  const [formData, setFormData] = useState({
    totalCredits: 0,
    gpa: 0,
    hasFGrade: false,
    completedThesis: false,
    thesisScore: 0,
    englishType: 'IELTS',
    englishScore: 0,
    completedMilitaryTraining: false,
    completedPhysicalEducation: false,
    completedSoftSkills: false,
    isUnderDisciplinaryAction: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const academicRecord = {
      ...formData,
      englishProficiency: {
        type: formData.englishType as 'IELTS' | 'TOEFL' | 'TOEIC' | 'VSTEP' | 'UIT',
        score: formData.englishScore,
      },
    };
    setResult(checkGraduationEligibility(academicRecord));
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {showForm ? 'Hide Graduation Check' : 'Check Graduation Eligibility'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Credits
              </label>
              <input
                type="number"
                value={formData.totalCredits}
                onChange={(e) => setFormData({...formData, totalCredits: Number(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                GPA (out of 4.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.gpa}
                onChange={(e) => setFormData({...formData, gpa: Number(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasFGrade"
                checked={formData.hasFGrade}
                onChange={(e) => setFormData({...formData, hasFGrade: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="hasFGrade" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Has F grade in any course
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="completedThesis"
                checked={formData.completedThesis}
                onChange={(e) => setFormData({...formData, completedThesis: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="completedThesis" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Completed Thesis/Alternative
              </label>
            </div>

            {formData.completedThesis && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Thesis Score (out of 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.thesisScore}
                  onChange={(e) => setFormData({...formData, thesisScore: Number(e.target.value)})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                English Proficiency Test
              </label>
              <select
                value={formData.englishType}
                onChange={(e) => setFormData({...formData, englishType: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL iBT</option>
                <option value="TOEIC">TOEIC</option>
                <option value="VSTEP">VSTEP</option>
                <option value="UIT">UIT Test</option>
              </select>
              <input
                type="number"
                step="0.5"
                value={formData.englishScore}
                onChange={(e) => setFormData({...formData, englishScore: Number(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Score"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="militaryTraining"
                  checked={formData.completedMilitaryTraining}
                  onChange={(e) => setFormData({...formData, completedMilitaryTraining: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="militaryTraining" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Completed Military Training
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="physicalEducation"
                  checked={formData.completedPhysicalEducation}
                  onChange={(e) => setFormData({...formData, completedPhysicalEducation: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="physicalEducation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Completed Physical Education
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="softSkills"
                  checked={formData.completedSoftSkills}
                  onChange={(e) => setFormData({...formData, completedSoftSkills: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="softSkills" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Completed Soft Skills
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="disciplinaryAction"
                  checked={formData.isUnderDisciplinaryAction}
                  onChange={(e) => setFormData({...formData, isUnderDisciplinaryAction: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="disciplinaryAction" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Under Disciplinary Action
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Check Eligibility
          </button>
        </form>
      )}

      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.eligible ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
        }`}>
          <h3 className="text-lg font-medium">
            {result.eligible ? '✅ Eligible for Graduation' : '❌ Not Eligible for Graduation'}
          </h3>
          {result.reasons.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {result.reasons.map((reason, index) => (
                <li key={index} className="text-sm">
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GraduationCheck;
