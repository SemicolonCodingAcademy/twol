'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(4px);
  overflow-x: auto;
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  margin-bottom: 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3f51b5;
  }

  &:focus {
    outline: none;
    border-color: #3f51b5;
    box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 10px;
  overflow: hidden;
`;

const Th = styled.th`
  background: #3f51b5;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;

  &:first-child {
    border-top-left-radius: 10px;
  }

  &:last-child {
    border-top-right-radius: 10px;
  }
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #333;
`;

const Tr = styled.tr`
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
  }

  &:last-child td {
    border-bottom: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3f51b5;
  animation: spin 1s ease-in-out infinite;
  margin: 2rem auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  background: #ffe6e6;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid #ffcccc;
`;

interface SpreadsheetInfo {
  id: string;
  name: string;
}

interface RawSpreadsheetData {
  'Store Name': string;
  'Keyword': string;
  'scroll (Success)': string;
  'alarm (Success)': string;
  'save_place (Success)': string;
  'save_keep (Success)': string;
  'feed (Success)': string;
}

interface SpreadsheetData {
  store_name: string;
  keyword: string;
  scroll_success: number;
  alarm_success: number;
  save_place_success: number;
  save_keep_success: number;
  feed_success: number;
}

function formatSpreadsheetName(name: string): string {
  const dateMatch = name.match(/(\d{4}-\d{2}-\d{2})/);
  if (!dateMatch) return name;

  const date = new Date(dateMatch[1]);
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return `${formattedDate} ${name.replace(dateMatch[1], '').trim()}`;
}

const SpreadsheetViewer: React.FC = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetInfo[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [data, setData] = useState<SpreadsheetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchSpreadsheets();
  }, []);

  const fetchSpreadsheets = async () => {
    try {
      setError('');
      const response = await fetch('/api/spreadsheets');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.details || data.error);
      }
      
      setSpreadsheets(data);
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch spreadsheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (sheetId: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/spreadsheet-data?id=${sheetId}`);
      const rawData = await response.json();
      
      if (rawData.error) {
        throw new Error(rawData.details || rawData.error);
      }

      const processedData = rawData.map((row: RawSpreadsheetData) => {
        const storeName = row['Store Name'].split('-')[0].trim();
        return {
          store_name: storeName,
          keyword: row['Keyword'],
          scroll_success: parseInt(row['scroll (Success)']) || 0,
          alarm_success: parseInt(row['alarm (Success)']) || 0,
          save_place_success: parseInt(row['save_place (Success)']) || 0,
          save_keep_success: parseInt(row['save_keep (Success)']) || 0,
          feed_success: parseInt(row['feed (Success)']) || 0,
        };
      });
      
      setData(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch spreadsheet data');
    } finally {
      setLoading(false);
    }
  };

  const handleSpreadsheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sheetId = e.target.value;
    setSelectedSheet(sheetId);
    if (sheetId) {
      fetchData(sheetId);
    } else {
      setData([]);
    }
  };

  return (
    <Container>
      <Select value={selectedSheet} onChange={handleSpreadsheetChange}>
        <option value="">스프레드시트 선택</option>
        {spreadsheets.map((sheet) => (
          <option key={sheet.id} value={sheet.id}>
            {formatSpreadsheetName(sheet.name)}
          </option>
        ))}
      </Select>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingSpinner />
      ) : data.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Store Name</Th>
              <Th>Keyword</Th>
              <Th>Scroll Success</Th>
              <Th>Alarm Success</Th>
              <Th>Save Place Success</Th>
              <Th>Save Keep Success</Th>
              <Th>Feed Success</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <Tr key={index}>
                <Td>{row.store_name}</Td>
                <Td>{row.keyword}</Td>
                <Td>{row.scroll_success}</Td>
                <Td>{row.alarm_success}</Td>
                <Td>{row.save_place_success}</Td>
                <Td>{row.save_keep_success}</Td>
                <Td>{row.feed_success}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          {selectedSheet ? 'No data available' : 'Please select a spreadsheet'}
        </div>
      )}
    </Container>
  );
};

export default SpreadsheetViewer; 