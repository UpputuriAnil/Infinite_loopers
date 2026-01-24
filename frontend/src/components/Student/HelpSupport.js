import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Book, Send, Search, ChevronDown, ChevronUp, Mail, Phone, Clock } from 'lucide-react';
import './HelpSupport.css';

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'technical', message: '' });

  const faqs = [
    { id: 1, question: 'How do I enroll in a course?', answer: 'Navigate to the Courses page, browse available courses, and click the "Enroll Now" button on any course you\'re interested in.' },
    { id: 2, question: 'How do I submit an assignment?', answer: 'Go to the Assignments section, select the assignment you want to submit, upload your file, and click "Submit Assignment".' },
    { id: 3, question: 'How can I track my progress?', answer: 'Your learning progress is displayed on your dashboard. You can also visit the Progress page for detailed statistics.' },
    { id: 4, question: 'How do I change my password?', answer: 'Go to Account Settings > Security tab, enter your current password and new password, then click "Change Password".' },
    { id: 5, question: 'Can I unenroll from a course?', answer: 'Yes, go to your enrolled courses, select the course, and click the "Unenroll" button. Note that this will reset your progress.' },
    { id: 6, question: 'How do I contact my instructor?', answer: 'You can message your instructor through the course discussion forum or email them directly from the course page.' }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    console.log('Submitting ticket:', ticketForm);
    alert('Support ticket submitted successfully! We\'ll get back to you soon.');
    setTicketForm({ subject: '', category: 'technical', message: '' });
  };

  return (
    <div className="help-container">
      <div className="help-header">
        <h1>Help & Support</h1>
        <p>We're here to help you succeed</p>
      </div>

      {/* Tab Navigation */}
      <div className="help-tabs">
        <button className={`help-tab ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => setActiveTab('faq')}>
          <HelpCircle size={20} />
          FAQ
        </button>
        <button className={`help-tab ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
          <MessageCircle size={20} />
          Contact Support
        </button>
        <button className={`help-tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
          <Book size={20} />
          Resources
        </button>
      </div>

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="help-content">
          <div className="search-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="faq-list">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <span>{faq.question}</span>
                  {expandedFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Support Tab */}
      {activeTab === 'contact' && (
        <div className="help-content">
          <div className="contact-grid">
            <div className="contact-methods">
              <h2>Get in Touch</h2>
              <p>Choose how you'd like to reach us</p>

              <div className="contact-card">
                <Mail size={24} />
                <h3>Email Support</h3>
                <p>support@eduflow.com</p>
                <span className="response-time">Response time: 24 hours</span>
              </div>

              <div className="contact-card">
                <Phone size={24} />
                <h3>Phone Support</h3>
                <p>+1 (555) 123-4567</p>
                <span className="response-time">Mon-Fri, 9AM-6PM EST</span>
              </div>

              <div className="contact-card">
                <Clock size={24} />
                <h3>Live Chat</h3>
                <p>Chat with our team</p>
                <button className="chat-btn">Start Chat</button>
              </div>
            </div>

            <div className="ticket-form-section">
              <h2>Submit a Support Ticket</h2>
              <form onSubmit={handleSubmitTicket} className="ticket-form">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account & Billing</option>
                    <option value="course">Course Content</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                    placeholder="Describe your issue in detail..."
                    rows="6"
                    required
                  />
                </div>

                <button type="submit" className="submit-ticket-btn">
                  <Send size={16} />
                  Submit Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="help-content">
          <div className="resources-grid">
            <div className="resource-card">
              <Book size={32} />
              <h3>User Guide</h3>
              <p>Complete guide to using the platform</p>
              <a href="#guide" className="resource-link">View Guide →</a>
            </div>
            <div className="resource-card">
              <HelpCircle size={32} />
              <h3>Video Tutorials</h3>
              <p>Step-by-step video walkthroughs</p>
              <a href="#tutorials" className="resource-link">Watch Videos →</a>
            </div>
            <div className="resource-card">
              <MessageCircle size={32} />
              <h3>Community Forum</h3>
              <p>Connect with other students</p>
              <a href="/forums" className="resource-link">Visit Forum →</a>
            </div>
            <div className="resource-card">
              <Book size={32} />
              <h3>Knowledge Base</h3>
              <p>Articles and documentation</p>
              <a href="#kb" className="resource-link">Browse Articles →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;
