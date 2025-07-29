import FileDropzone from "../components/FileDropzone";

export default function FileAnalysis() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Document Analysis</h1>
        <p className="text-lg text-gray-600">
          Upload wedding contracts, budgets, vendor quotes, or planning documents for AI-powered analysis. 
          Get insights, recommendations, and key information extracted from your files.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <FileDropzone />
      </div>

      <div className="mt-8 bg-gradient-to-r from-soft-gold/10 to-blush/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What can I analyze?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">📄 Contracts & Legal Documents</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Venue contracts and terms</li>
              <li>• Vendor service agreements</li>
              <li>• Catering contracts</li>
              <li>• Photography/videography contracts</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">💰 Financial Documents</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Budget spreadsheets</li>
              <li>• Vendor quotes and estimates</li>
              <li>• Payment schedules</li>
              <li>• Cost breakdowns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}