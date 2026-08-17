import "./AnalysisView.css"; // ya jis CSS file me analysis-grid wali CSS hai

function AnalysisView({ analysis }) {

  if (!analysis) {
    return (
      <div className="detail-card">
        <h3>AI Analysis</h3>
        <p>No AI analysis available.</p>
      </div>
    );
  }

  return (
    <div className="analysis-grid">

      {/* Summary */}
      <div className="detail-card">
        <h3>Summary</h3>
        <p>{analysis.summary}</p>
      </div>

      {/* Key Findings */}
      <div className="detail-card">
        <h3>Key Findings</h3>

        {analysis.keyFindings?.length > 0 ? (
          <ul>
            {analysis.keyFindings.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No key findings available.</p>
        )}
      </div>

      {/* Abnormal Values */}
      <div className="detail-card">
        <h3>Abnormal Values</h3>

        {analysis.abnormalValues?.length > 0 ? (
          <ul>
            {analysis.abnormalValues.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>✅ No abnormal values detected.</p>
        )}
      </div>

      {/* Possible Concerns */}
      <div className="detail-card">
        <h3>Possible Concerns</h3>

        {analysis.possibleConcerns?.length > 0 ? (
          <ul>
            {analysis.possibleConcerns.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No significant concerns identified.</p>
        )}
      </div>

      {/* Medication Information */}
      <div className="detail-card">
        <h3>Common Medication Information</h3>

        {analysis.commonMedicationInformation?.length > 0 ? (
          <ul>
            {analysis.commonMedicationInformation.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No medication information available.</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="detail-card">
        <h3>General Recommendations</h3>

        {analysis.generalRecommendations?.length > 0 ? (
          <ul>
            {analysis.generalRecommendations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No recommendations available.</p>
        )}
      </div>

      {/* Doctor Advice */}
      <div className="detail-card">
        <h3>Doctor Advice</h3>

        <p>
          {analysis.doctorAdvice ||
            "Please consult a qualified doctor."}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="detail-card">
        <h3>Disclaimer</h3>

        <p>{analysis.disclaimer}</p>
      </div>

    </div>
  );
}

export default AnalysisView;