import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          Education <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Bachelor's Degree</h4>
                <h5>Delhi University</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Pursuing graduation while building practical skills in digital
              marketing, branding, content creation, and social media strategy.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Freelance Digital Marketing Projects</h4>
                <h5>Schools, restaurants, and local businesses</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Created social media posters, managed Instagram and Facebook
              pages, edited promotional reels, optimized Google Business
              Profiles, and improved local visibility with SEO ideas.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Class 12</h4>
                <h5>Higher Secondary Education</h5>
              </div>
              <h3>DONE</h3>
            </div>
            <p>
              Completed higher secondary education and continued building a
              career path in digital marketing, branding, and creative content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
