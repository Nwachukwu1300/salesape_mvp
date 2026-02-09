import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressCircle from '../components/ProgressCircle.tsx';

describe('ProgressCircle', () => {
  it('renders the percentage and label', () => {
    render(<ProgressCircle value={72} label="SEO" />);
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('SEO')).toBeInTheDocument();
  });
});
