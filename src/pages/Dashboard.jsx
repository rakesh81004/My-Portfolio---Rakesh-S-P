import React, { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #090917;
  color: #f2f3f4;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 16px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const GateCard = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 360px;
  background-color: rgba(17, 25, 40, 0.83);
  border: 1px solid rgba(255, 255, 255, 0.125);
  border-radius: 12px;
  padding: 24px;
`;

const Input = styled.input`
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 15px;
  color: #f2f3f4;
  outline: none;
  &:focus {
    border-color: #854ce6;
  }
`;

const Button = styled.button`
  background: linear-gradient(225deg, rgb(200, 0, 130) 0%, rgb(4, 167, 237) 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
`;

const ErrorText = styled.div`
  color: #ff6b6b;
  font-size: 13px;
`;

const StatRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
`;

const StatCard = styled.div`
  background-color: rgba(17, 25, 40, 0.83);
  border: 1px solid rgba(255, 255, 255, 0.125);
  border-radius: 12px;
  padding: 18px 28px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #04a7ed;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #b1b2b3;
  margin-top: 4px;
`;

const StatSub = styled.div`
  font-size: 12px;
  color: #b1b2b3;
  margin-top: -12px;
  margin-bottom: 16px;
`;

const Table = styled.div`
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: rgba(17, 25, 40, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
`;

const RowTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const Muted = styled.span`
  color: #b1b2b3;
`;

const TagInput = styled.input`
  margin-top: 6px;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  color: #f2f3f4;
  outline: none;
  &:focus {
    border-color: #854ce6;
  }
`;

const Dashboard = () => {
  const [key, setKey] = useState(
    () => sessionStorage.getItem("dashboardKey") || ""
  );
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const fetchVisits = async (dashboardKey) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/.netlify/functions/get-visits", {
        headers: { "x-dashboard-key": dashboardKey },
      });
      if (!res.ok) {
        throw new Error(
          res.status === 401 ? "Incorrect key" : "Failed to load visits"
        );
      }
      const json = await res.json();
      setData(json);
      setAuthed(true);
      sessionStorage.setItem("dashboardKey", dashboardKey);
    } catch (err) {
      setError(err.message);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (key) fetchVisits(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchVisits(key);
  };

  const saveTag = async (visitKey, tag) => {
    try {
      await fetch("/.netlify/functions/tag-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dashboard-key": key,
        },
        body: JSON.stringify({ visitKey, tag }),
      });
      fetchVisits(key);
    } catch {
      // best-effort; UI will just show the stale value if this fails
    }
  };

  if (!authed) {
    return (
      <Container>
        <Title>Visitor Dashboard</Title>
        <GateCard onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Dashboard key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Unlock"}
          </Button>
          {error && <ErrorText>{error}</ErrorText>}
        </GateCard>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Visitor Dashboard</Title>
      <StatRow>
        <StatCard>
          <StatValue>{data?.totalVisits ?? 0}</StatValue>
          <StatLabel>Total Visits</StatLabel>
        </StatCard>
      </StatRow>
      {data?.taggedAsMe > 0 && (
        <StatSub>
          ({data.taggedAsMe} visit{data.taggedAsMe === 1 ? "" : "s"} tagged
          "Me" — excluded from the count above)
        </StatSub>
      )}
      <Table>
        {data?.visits?.length ? (
          data.visits.map((visit) => (
            <VisitRow key={visit.key} visit={visit} onSaveTag={saveTag} />
          ))
        ) : (
          <Muted>No visits recorded yet.</Muted>
        )}
      </Table>
    </Container>
  );
};

const VisitRow = ({ visit, onSaveTag }) => {
  const [tag, setTag] = useState(visit.tag || "");

  return (
    <Row>
      <RowTop>
        <span>{new Date(visit.time).toLocaleString()}</span>
        <span>{visit.location}</span>
        <Muted>{visit.device}</Muted>
        <Muted>{visit.ip}</Muted>
      </RowTop>
      <TagInput
        placeholder='Tag this visit (e.g. "Me", "Recruiter")'
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        onBlur={() => onSaveTag(visit.key, tag)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
    </Row>
  );
};

export default Dashboard;
