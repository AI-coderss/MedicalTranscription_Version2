import React from 'react';
import { PDFDownloadLink, Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  listItem: {
    marginLeft: 10,
    marginBottom: 5,
  },
});

// Helper function to parse and render markdown-like text
const renderContent = (text) => {
  const lines = text.split('\n');
  return lines.map((line, index) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      // Bold text
      return (
        <Text key={index} style={[styles.text, styles.bold]}>
          {line.slice(2, -2)}
        </Text>
      );
    } else if (line.startsWith('- ')) {
      // List item
      return (
        <Text key={index} style={[styles.text, styles.listItem]}>
          • {line.slice(2)}
        </Text>
      );
    } else {
      // Regular text
      return (
        <Text key={index} style={styles.text}>
          {line}
        </Text>
      );
    }
  });
};

const PDFDownloader = ({ content, fileName }) => (
  <PDFDownloadLink className='pdf-download-link'
    document={
      <Document>
        <Page style={styles.page}>{renderContent(content)}</Page>
      </Document>
    }
    fileName={fileName}
    style={{
      textDecoration: 'none',
      color: '#007bff',
      fontSize: '0.8rem',
      marginRight: '10px',
    }}
  >
    Download PDF ⬇️
  </PDFDownloadLink>
);

export default PDFDownloader;
