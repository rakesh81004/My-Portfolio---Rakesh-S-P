import React, { useRef, useState } from "react";
import styled from "styled-components";
import emailjs from "@emailjs/browser";
import EarthCanvas from "../canvas/Earth";

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  z-index: 1;
  align-items: center;
  @media (max-width: 960px) {
    padding: 0px;
  }
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  max-width: 1350px;
  padding: 0px 0px 80px 0px;
  gap: 12px;
  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const Title = styled.div`
  font-size: 52px;
  text-align: center;
  font-weight: 600;
  margin-top: 20px;
  color: ${({ theme }) => theme.text_primary};
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 32px;
  }
`;

const Desc = styled.div`
  font-size: 18px;
  text-align: center;
  max-width: 600px;
  color: ${({ theme }) => theme.text_secondary};
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 16px;
  }
`;

const ContactForm = styled.form`
  width: 95%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  background-color: rgba(17, 25, 40, 0.83);
  border: 1px solid rgba(255, 255, 255, 0.125);
  padding: 32px;
  border-radius: 12px;
  box-shadow: rgba(23, 92, 230, 0.1) 0px 4px 24px;
  margin-top: 28px;
  gap: 12px;
`;

const ContactTitle = styled.div`
  font-size: 28px;
  margin-bottom: 6px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const ContactInput = styled.input`
  flex: 1;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary + 50};
  outline: none;
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid ${({ theme }) => theme.primary};
  }
`;

const ContactInputMessage = styled.textarea`
  flex: 1;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary + 50};
  outline: none;
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid ${({ theme }) => theme.primary};
  }
`;

const ContactButton = styled.input`
  width: 100%;
  text-decoration: none;
  text-align: center;
  background: rgb(200, 0, 130);
  background: linear-gradient(
    225deg,
    rgb(200, 0, 130) 0%,
    rgb(4, 167, 237) 100%
  );
  padding: 13px 16px;
  margin-top: 2px;
  border-radius: 12px;
  border: none;
  color: ${({ theme }) => theme.text_primary};
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const StatusMessage = styled.div`
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  padding: 10px 14px;
  border-radius: 8px;
  color: ${({ $variant }) =>
    $variant === "success" ? "#2ecc71" : "#ff6b6b"};
  background: ${({ $variant }) =>
    $variant === "success"
      ? "rgba(46, 204, 113, 0.12)"
      : "rgba(255, 107, 107, 0.12)"};
  border: 1px solid
    ${({ $variant }) =>
      $variant === "success"
        ? "rgba(46, 204, 113, 0.4)"
        : "rgba(255, 107, 107, 0.4)"};
`;

const Contact = () => {
  const form = useRef(null);  // ✅ Make sure the ref is initialized properly
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.current) {
      console.error("Form reference is null.");
      return;
    }

    setStatus("loading");

    emailjs
      .sendForm(
        "service_htcz5nc",
        "template_nb51dqq",
        form.current,  // ✅ Ensure this is correctly assigned
        "ZOcF3ouPDNDT9zWwp"
      )
      .then(
        (result) => {
          setStatus("success");
          form.current.reset();  // ✅ Correct reset method
        },
        (error) => {
          console.error("EmailJS error:", error);
          setStatus("error");
        }
      );
  };

  return (
    <Container>
      <Wrapper>
        <EarthCanvas />
        <Title>Contact</Title>
        <Desc>
          Don't hesitate to reach out to me for any queries or opportunities!
        </Desc>
        <ContactForm ref={form} onSubmit={handleSubmit}>
          {/* ✅ Add ref={form} to attach useRef to the form */}
          <ContactTitle>Email Me 🚀</ContactTitle>
          <ContactInput placeholder="Your Email" name="from_email" required />
          <ContactInput placeholder="Your Name" name="from_name" required />
          <ContactInput placeholder="Subject" name="subject" required />
          <ContactInputMessage
            placeholder="Message"
            name="message"
            rows={4}
            required
          />
          {status === "loading" ? (
            <ContactButton
              as="button"
              type="button"
              disabled
            >
              <Spinner /> Sending...
            </ContactButton>
          ) : (
            <ContactButton type="submit" value="Send" />
          )}
          {status === "success" && (
            <StatusMessage $variant="success">
              Message sent successfully! I'll get back to you soon.
            </StatusMessage>
          )}
          {status === "error" && (
            <StatusMessage $variant="error">
              Something went wrong. Please try again later.
            </StatusMessage>
          )}
        </ContactForm>
      </Wrapper>
    </Container>
  );
};

export default Contact;
