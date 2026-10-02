import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL =
  localStorage.getItem("geovision_api_url") ||
  "https://geovision-ai-backend.onrender.com";

function App() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const revealTargets = document.querySelectorAll([
      ".content-container .page-heading",
      ".content-container .hero-section",
      ".content-container .dashboard-overview",
      ".content-container .overview-card",
      ".content-container .dashboard-result-card",
      ".content-container .dashboard-start-card",
      ".content-container .upload-card",
      ".content-container .analysis-progress",
      ".content-container .results-header",
      ".content-container .stats-grid",
      ".content-container .stat-card",
      ".content-container .analysis-section",
      ".content-container .analysis-card",
      ".content-container .distribution-card",
      ".content-container .report-section",
      ".content-container .report-row",
      ".content-container .dataset-card",
      ".content-container .cloud-overview",
      ".content-container .cloud-info-grid > *",
      ".content-container .settings-card",
      ".content-container .empty-state",
    ].join(","));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    revealTargets.forEach((target, index) => {
      target.classList.add("scroll-reveal");
      target.style.setProperty(
        "--reveal-delay",
        `${(index % 4) * 65}ms`
      );
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [activePage, loading, result]);

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setResult(null);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files[0]);
  };

  const runAnalysis = async () => {
    if (!file) {
      setError("Please select a satellite image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the analysis server.");
    } finally {
      setLoading(false);
    }
  };

  const getCategory = (name) => {
    return result?.categories?.find((item) => item.name === name);
  };

  const getPercentage = (name) => {
    return getCategory(name)?.percentage ?? 0;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
  };

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <span>G</span>
          </div>

          <div>
            <h1>GeoVision</h1>
            <p>AI Intelligence</p>
          </div>
        </div>

        <nav className="navigation">
          <div className="nav-section-title">
            WORKSPACE
          </div>

          <button
            className={`nav-item ${activePage === "Dashboard" ? "active" : ""}`}
            onClick={() => setActivePage("Dashboard")}
          >
            <span className="nav-icon">⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${activePage === "Image Analysis" ? "active" : ""}`}
            onClick={() => setActivePage("Image Analysis")}
          >
            <span className="nav-icon">◈</span>
            Image Analysis
          </button>

          <button
            className={`nav-item ${activePage === "Datasets" ? "active" : ""}`}
            onClick={() => setActivePage("Datasets")}
          >
            <span className="nav-icon">▦</span>
            Datasets
          </button>

          <button
            className={`nav-item ${activePage === "Reports" ? "active" : ""}`}
            onClick={() => setActivePage("Reports")}
          >
            <span className="nav-icon">▤</span>
            Reports
          </button>

          <div className="nav-section-title">
            SYSTEM
          </div>

          <button
            className={`nav-item ${activePage === "Cloud Storage" ? "active" : ""}`}
            onClick={() => setActivePage("Cloud Storage")}
          >
            <span className="nav-icon">☁</span>
            Cloud Storage
          </button>

          <button
            className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
            onClick={() => setActivePage("Settings")}
          >
            <span className="nav-icon">⚙</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="cloud-card">
            <div className="cloud-icon">☁</div>
            <div>
              <strong>AWS S3</strong>
              <span>Cloud storage ready</span>
            </div>
            <div className="online-dot"></div>
          </div>

          <div className="sidebar-version">
            GeoVision AI · v1.0
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Workspace <span>/</span> Dashboard
            </div>
          </div>

          <div className="system-status">
            <span className="status-dot"></span>
            System operational
          </div>
        </header>

        <div className="content-container" key={activePage}>
          {activePage === "Dashboard" && (
            <DashboardPage
              result={result}
              preview={preview}
              file={file}
              loading={loading}
              runAnalysis={runAnalysis}
              error={error}
            />
          )}

          {activePage === "Image Analysis" && (
            <ImageAnalysisPage
              file={file}
              preview={preview}
              result={result}
              loading={loading}
              error={error}
              selectFile={selectFile}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              handleDrop={handleDrop}
              dragging={dragging}
              setDragging={setDragging}
              runAnalysis={runAnalysis}
            />
          )}

          {activePage === "Datasets" && (
            <DatasetsPage />
          )}

          {activePage === "Reports" && (
            <ReportsPage
              result={result}
              file={file}
            />
          )}

          {activePage === "Cloud Storage" && (
            <CloudStoragePage
              result={result}
            />
          )}

          {activePage === "Settings" && (
            <SettingsPage />
          )}

        </div>
      </main>
    </div>
  );
}


/* ---------------- COMPONENTS ---------------- */

function DashboardPage({ result, preview, file, loading, runAnalysis, error }) {
  return (
    <>
      <section className="hero-section">
        <div>
          <div className="eyebrow">
            SATELLITE INTELLIGENCE PLATFORM
          </div>

          <h2>
            Understand the Earth
            <br />
            <span>through intelligent imagery.</span>
          </h2>

          <p>
            Upload satellite imagery and transform raw pixels into
            meaningful land-use intelligence using computer vision.
          </p>
        </div>

        <div className="hero-badge">
          <span>●</span>
          AI + Computer Vision
        </div>
      </section>

      <div className="dashboard-overview">
        <div className="overview-card">
          <div className="overview-icon blue">◈</div>
          <div>
            <span>ANALYSIS ENGINE</span>
            <strong>HSV Computer Vision</strong>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon green">✓</div>
          <div>
            <span>BACKEND</span>
            <strong>FastAPI Online</strong>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon purple">☁</div>
          <div>
            <span>CLOUD</span>
            <strong>AWS S3 Connected</strong>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon orange">◎</div>
          <div>
            <span>STATUS</span>
            <strong>Operational</strong>
          </div>
        </div>
      </div>

      {result ? (
        <div className="dashboard-result-card">
          <div>
            <div className="eyebrow">
              LATEST ANALYSIS
            </div>

            <h3>{file?.name || "Satellite Image"}</h3>

            <p>
              Analysis completed successfully.
            </p>
          </div>

          <button
            className="analyze-button"
            onClick={() => {
              document
                .getElementById("analysis-results")
                ?.scrollIntoView({
                  behavior: "smooth"
                });
            }}
          >
            View analysis →
          </button>
        </div>
      ) : (
        <div className="dashboard-start-card">
          <div className="start-icon">
            ◈
          </div>

          <div>
            <h3>Start your first analysis</h3>

            <p>
              Go to Image Analysis to upload satellite
              imagery and generate land-use intelligence.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function ImageAnalysisPage({
  file,
  preview,
  result,
  loading,
  error,
  selectFile,
  fileInputRef,
  handleFileChange,
  handleDrop,
  dragging,
  setDragging,
  runAnalysis,
}) {
  return (
    <>
      <section className="page-heading">
        <div className="eyebrow">
          IMAGE ANALYSIS
        </div>

        <h2>Satellite Image Analysis</h2>

        <p>
          Upload an image and generate land-use intelligence
          using computer vision.
        </p>
      </section>

      <section className="upload-card">
        <div className="section-heading">
          <div>
            <h3>Upload imagery</h3>
            <p>
              Supported formats: JPG, JPEG, PNG and TIFF
            </p>
          </div>
        </div>

        <div
          className={`drop-zone ${dragging ? "dragging" : ""} ${
            preview ? "has-preview" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !preview && fileInputRef.current.click()}
        >
          {!preview ? (
            <div className="upload-content">
              <div className="upload-icon">
                ↑
              </div>

              <h4>
                Drop your satellite image here
              </h4>

              <p>
                or click to browse
              </p>

              <button
                className="browse-button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
              >
                Select image
              </button>
            </div>
          ) : (
            <div className="selected-image">
              <img
                src={preview}
                alt="Satellite preview"
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/tiff"
            onChange={handleFileChange}
            hidden
          />
        </div>

        {file && (
          <div className="analysis-action">
            <div className="selected-file">
              <span className="file-icon">
                IMG
              </span>

              <div>
                <strong>{file.name}</strong>
                <span>
                  Ready for analysis
                </span>
              </div>
            </div>

            <button
              className="analyze-button"
              onClick={runAnalysis}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Run analysis</span>
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>
        )}

        {loading && (
          <div className="analysis-progress" role="status" aria-live="polite">
            <div className="analysis-progress-copy">
              <strong>Processing satellite imagery</strong>
              <span>Uploading and classifying land cover</span>
            </div>
            <div className="analysis-progress-track" aria-hidden="true">
              <span />
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>!</span>
            {error}
          </div>
        )}
      </section>

      {result && (
        <div id="analysis-results">
          <section className="results-header">
            <div>
              <div className="eyebrow">
                ANALYSIS COMPLETE
              </div>

              <h3>
                Land-use intelligence
              </h3>

              <p>
                Generated from the uploaded satellite image.
              </p>
            </div>

            <div className="method-badge">
              ● HSV Computer Vision
            </div>
          </section>

          <section className="stats-grid">
            {result.categories?.map((category) => (
              <div
                className="stat-card"
                key={category.name}
              >
                <div className="stat-icon blue">
                  ◈
                </div>

                <div className="stat-content">
                  <span>
                    {category.name}
                  </span>

                  <div>
                    <strong>
                      {category.percentage.toFixed(2)}
                    </strong>

                    <small>%</small>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section className="analysis-section">
            <div className="section-heading">
              <div>
                <h3>
                  Analysis layers
                </h3>

                <p>
                  Visual interpretation of the satellite image.
                </p>
              </div>
            </div>

            <div className="image-grid">
              <AnalysisCard
                title="Original imagery"
                subtitle="Input image"
                image={preview}
              />

              <AnalysisCard
                title="Water mask"
                subtitle="Detected water"
                image={`data:image/png;base64,${result.water_mask}`}
              />

              <AnalysisCard
                title="Vegetation mask"
                subtitle="Detected vegetation"
                image={`data:image/png;base64,${result.crop_mask}`}
              />

              <AnalysisCard
                title="Land-use classification"
                subtitle="Pixel classification"
                image={`data:image/png;base64,${result.classification_image}`}
              />

              <AnalysisCard
                title="Classification overlay"
                subtitle="Overlay visualization"
                image={`data:image/png;base64,${result.overlay_image}`}
                large
              />

              <DistributionCard result={result} />
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function DatasetsPage() {
  return (
    <section className="page-content">
      <div className="page-heading">
        <div className="eyebrow">
          DATASETS
        </div>

        <h2>Dataset Management</h2>

        <p>
          Manage datasets used for GeoVision AI model development.
        </p>
      </div>

      <div className="dataset-grid">
        <div className="dataset-card">
          <div className="dataset-icon">
            ◈
          </div>

          <div>
            <span className="dataset-type">
              SEGMENTATION DATASET
            </span>

            <h3>
              DeepGlobe Land Cover
            </h3>

            <p>
              Satellite imagery and pixel-level land-cover
              masks for semantic segmentation.
            </p>
          </div>

          <div className="dataset-stats">
            <div>
              <span>Images</span>
              <strong>803</strong>
            </div>

            <div>
              <span>Image size</span>
              <strong>2448 × 2448</strong>
            </div>

            <div>
              <span>Model</span>
              <strong>U-Net</strong>
            </div>
          </div>
        </div>

        <div className="dataset-card">
          <div className="dataset-icon green-icon">
            ✓
          </div>

          <div>
            <span className="dataset-type">
              COMPUTER VISION
            </span>

            <h3>
              HSV Classification
            </h3>

            <p>
              Color-based baseline used for rapid land-use
              analysis and dashboard visualization.
            </p>
          </div>

          <div className="dataset-stats">
            <div>
              <span>Method</span>
              <strong>HSV</strong>
            </div>

            <div>
              <span>Classes</span>
              <strong>5</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>Ready</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportsPage({ result, file }) {
  return (
    <section className="page-content">
      <div className="page-heading">
        <div className="eyebrow">
          REPORTS
        </div>

        <h2>Analysis Reports</h2>

        <p>
          Review and export your satellite analysis results.
        </p>
      </div>

      {!result ? (
        <div className="empty-state">
          <div className="empty-icon">
            ▤
          </div>

          <h3>
            No reports yet
          </h3>

          <p>
            Run a satellite image analysis to generate
            your first report.
          </p>
        </div>
      ) : (
        <div className="report-section">
          <div className="report-header">
            <div>
              <div className="eyebrow">
                LATEST REPORT
              </div>

              <h3>
                {file?.name || "Satellite Analysis"}
              </h3>
            </div>

            <button
              className="secondary-button"
              onClick={() => window.print()}
            >
              Export report
            </button>
          </div>

          <div className="report-grid">
            <div className="report-table">
              {result.categories?.map((category) => (
                <div
                  className="report-row"
                  key={category.name}
                >
                  <span>
                    {category.name}
                  </span>

                  <div className="report-progress">
                    <div
                      style={{
                        width: `${category.percentage}%`
                      }}
                    />
                  </div>

                  <strong>
                    {category.percentage.toFixed(2)}%
                  </strong>
                </div>
              ))}
            </div>

            <div className="storage-panel">
              <div className="storage-icon">
                ✓
              </div>

              <div>
                <span className="panel-label">
                  REPORT STATUS
                </span>

                <h4>
                  Analysis completed
                </h4>

                <p>
                  The report was generated successfully
                  from the satellite imagery.
                </p>

                <div className="storage-info">
                  <div>
                    <span>Method</span>
                    <strong>
                      HSV Computer Vision
                    </strong>
                  </div>

                  <div>
                    <span>Water</span>
                    <strong>
                      {result.water_percentage}%
                    </strong>
                  </div>

                  <div>
                    <span>Land</span>
                    <strong>
                      {result.land_percentage}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CloudStoragePage({ result }) {
  return (
    <section className="page-content">
      <div className="page-heading">
        <div className="eyebrow">
          CLOUD INFRASTRUCTURE
        </div>

        <h2>AWS S3 Storage</h2>

        <p>
          Monitor the cloud storage used by GeoVision AI.
        </p>
      </div>

      <div className="cloud-overview">
        <div className="cloud-status-card">
          <div className="big-cloud-icon">
            ☁
          </div>

          <div>
            <span>CONNECTION STATUS</span>

            <h3>
              Connected
            </h3>

            <p>
              GeoVision AI is connected to Amazon S3.
            </p>
          </div>

          <div className="connected-badge">
            ● Online
          </div>
        </div>

        <div className="s3-details">
          <div>
            <span>Bucket</span>

            <strong>
              {result?.s3_bucket ||
                "geovision-ai-images-2026-chaitanya"}
            </strong>
          </div>

          <div>
            <span>Region</span>

            <strong>
              {result?.s3_region || "us-east-1"}
            </strong>
          </div>

          <div>
            <span>Latest object</span>

            <strong>
              {result?.s3_key || "No analysis uploaded yet"}
            </strong>
          </div>
        </div>
      </div>

      <div className="cloud-info-grid">
        <div className="info-card">
          <span>STORAGE SERVICE</span>
          <h3>Amazon S3</h3>
          <p>
            Original satellite images are stored securely
            in your AWS S3 bucket.
          </p>
        </div>

        <div className="info-card">
          <span>UPLOAD PIPELINE</span>
          <h3>FastAPI → S3</h3>
          <p>
            Every analysis request uploads the original
            image to cloud storage.
          </p>
        </div>

        <div className="info-card">
          <span>ACCESS</span>
          <h3>Private</h3>
          <p>
            Images are not exposed publicly by the
            dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}

function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem("geovision_api_url") ||
    "http://127.0.0.1:8000"
  );

  const saveSettings = () => {
    localStorage.setItem(
      "geovision_api_url",
      apiUrl
    );

    alert("Settings saved successfully.");
  };

  return (
    <section className="page-content">
      <div className="page-heading">
        <div className="eyebrow">
          APPLICATION SETTINGS
        </div>

        <h2>
          Settings
        </h2>

        <p>
          Configure your GeoVision AI application.
        </p>
      </div>

      <div className="settings-card">
        <div className="settings-section">
          <h3>
            Backend connection
          </h3>

          <p>
            URL used by the React application to communicate
            with FastAPI.
          </p>

          <label>
            API Base URL
          </label>

          <input
            className="settings-input"
            value={apiUrl}
            onChange={(e) =>
              setApiUrl(e.target.value)
            }
          />
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <h3>
            Analysis engine
          </h3>

          <p>
            Current image analysis method.
          </p>

          <div className="setting-option">
            <div>
              <strong>
                HSV Computer Vision
              </strong>

              <span>
                Current production analysis engine
              </span>
            </div>

            <div className="setting-active">
              Active
            </div>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <h3>
            Cloud storage
          </h3>

          <p>
            AWS S3 is enabled for original image storage.
          </p>

          <div className="setting-option">
            <div>
              <strong>
                Amazon S3
              </strong>

              <span>
                geovision-ai-images-2026-chaitanya
              </span>
            </div>

            <div className="setting-active">
              Connected
            </div>
          </div>
        </div>

        <button
          className="analyze-button save-button"
          onClick={saveSettings}
        >
          Save settings
        </button>
      </div>
    </section>
  );
}

function StatCard({ label, value, unit, color, icon }) {
  return (
    <div className="stat-card">

      <div className={`stat-icon ${color}`}>
        {icon}
      </div>

      <div className="stat-content">
        <span>{label}</span>

        <div>
          <strong>{Number(value).toFixed(2)}</strong>
          <small>{unit}</small>
        </div>
      </div>
    </div>
  );
}


function AnalysisCard({ title, subtitle, image, large }) {
  return (
    <div className={`analysis-card ${large ? "large" : ""}`}>

      <div className="analysis-card-header">
        <div>
          <h4>{title}</h4>
          <span>{subtitle}</span>
        </div>

        <span className="view-icon">↗</span>
      </div>

      <div className="analysis-image">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="missing-image">
            Image unavailable
          </div>
        )}
      </div>

    </div>
  );
}


function DistributionCard({ result }) {
  const categories = result.categories || [];

  return (
    <div className="distribution-card">

      <div className="analysis-card-header">
        <div>
          <h4>Area distribution</h4>
          <span>Classified land coverage</span>
        </div>
      </div>

      <div className="distribution-chart">

        {categories.map((category) => (
          <div
            className="chart-item"
            key={category.name}
          >
            <div className="chart-value">
              {category.percentage.toFixed(2)}%
            </div>

            <div className="chart-column">
              <div
                className="chart-bar"
                style={{
                  height: `${Math.max(
                    category.percentage * 2.5,
                    8
                  )}px`,
                }}
              ></div>
            </div>

            <span>
              {category.name
                .replace("Crops / Vegetation", "Vegetation")
                .replace("Desert / Dry Land", "Dry Land")
                .replace("Roads / Buildings", "Built-up")}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
}

export default App;