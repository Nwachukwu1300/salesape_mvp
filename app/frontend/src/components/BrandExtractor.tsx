import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardContent, CardHeader } from './Card';
import { Badge } from './Badge';
import { Palette, Type, Image as ImageIcon, Check, Loader2, Upload } from 'lucide-react';

interface BrandExtractorProps {
  websiteUrl?: string;
  instagramUrl?: string;
  businessDescription?: string;
  onComplete: (branding: ExtractedBranding) => void;
}

export interface ExtractedBranding {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  logo?: string;
  fonts: {
    heading: string;
    body: string;
  };
}

export function BrandExtractor({ websiteUrl: initialUrl = '', instagramUrl, businessDescription, onComplete }: BrandExtractorProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedBrand, setExtractedBrand] = useState<ExtractedBranding | null>(null);
  const [logoFile, setLogoFile] = useState<string | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExtracting(true);
    try {
      // Choose appropriate backend scraping endpoint
      let result: any = null;
      if (url.includes('instagram.com')) {
        const res = await fetch('/parse-instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        result = await res.json();
      } else {
        const res = await fetch('/scrape-website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        result = await res.json();
      }

      // Map scraped data into a simple branding object
      const mockBranding: ExtractedBranding = {
        colors: {
          primary: '#8B5CF6',
          secondary: '#6366F1',
          accent: '#EC4899',
          background: '#FFFFFF',
          text: '#1F2937',
        },
        logo: logoFile || result?.images?.[0] || undefined,
        fonts: {
          heading: 'Inter',
          body: 'Inter',
        },
      };

      setExtractedBrand(mockBranding);
    } catch (err) {
      console.error('Brand extraction failed', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFile(reader.result as string);
        if (extractedBrand) {
          setExtractedBrand({
            ...extractedBrand,
            logo: reader.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (colorKey: keyof ExtractedBranding['colors'], value: string) => {
    if (extractedBrand) {
      setExtractedBrand({
        ...extractedBrand,
        colors: {
          ...extractedBrand.colors,
          [colorKey]: value,
        },
      });
    }
  };

  const handleComplete = () => {
    if (extractedBrand) {
      onComplete(extractedBrand);
    }
  };

  return (
    <div className="space-y-6">
      {!extractedBrand && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900">Extract Brand from Website</h3>
            <p className="text-gray-600 mt-1">
              We'll automatically extract colors, fonts, and logo from your existing site
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExtract} className="space-y-4">
              <Input
                label="Your Website URL"
                type="url"
                placeholder="https://yourbusiness.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />

              <div className="border-t border-gray-200 pt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Or Upload Your Logo
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-violet-500 transition-colors">
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">
                          {logoFile ? 'Logo uploaded ✓' : 'Click to upload logo'}
                        </span>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting Brand...
                  </>
                ) : (
                  <>
                    <Palette className="w-5 h-5" />
                    Extract Brand Elements
                  </>
                )}
              </Button>
            </form>

            {isExtracting && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f724de' }} />
                  Analyzing website colors...
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f724de' }} />
                  Detecting fonts...
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f724de' }} />
                  Extracting logo...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {extractedBrand && (
        <div className="space-y-6">
          {/* Color Palette */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-violet-600" />
                  <h3 className="text-lg font-bold text-gray-900">Color Palette</h3>
                </div>
                <Badge variant="success">Extracted</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(extractedBrand.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key}
                    </label>
                    <div className="flex flex-col gap-2">
                      <div
                        className="h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
                        style={{ backgroundColor: value }}
                        onClick={() => {
                          const input = document.getElementById(`color-${key}`) as HTMLInputElement;
                          input?.click();
                        }}
                      />
                      <input
                        id={`color-${key}`}
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof ExtractedBranding['colors'], e.target.value)}
                        className="w-full h-8 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof ExtractedBranding['colors'], e.target.value)}
                        className="text-xs text-center py-1 px-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" style={{ color: '#f724de' }} />
                  <h3 className="text-lg font-bold text-gray-900">Logo</h3>
                </div>
                <Badge variant={extractedBrand.logo ? 'success' : 'warning'}>
                  {extractedBrand.logo ? 'Found' : 'Not Found'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {extractedBrand.logo ? (
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img
                      src={extractedBrand.logo}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-3">
                      Your logo will be used across your new website
                    </p>
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" as="span">
                        <Upload className="w-4 h-4" />
                        Replace Logo
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No logo detected on the website</p>
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" as="span">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fonts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-violet-600" />
                  <h3 className="text-lg font-bold text-gray-900">Typography</h3>
                </div>
                <Badge variant="success">Extracted</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Heading Font</div>
                  <div className="text-3xl font-bold" style={{ fontFamily: extractedBrand.fonts.heading }}>
                    {extractedBrand.fonts.heading}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Body Font</div>
                  <div className="text-lg" style={{ fontFamily: extractedBrand.fonts.body }}>
                    {extractedBrand.fonts.body}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-2" style={{ backgroundColor: '#f4f0e5', borderColor: '#f724de' }}>
            <CardHeader>
              <h3 className="text-lg font-bold text-gray-900">Brand Preview</h3>
              <p className="text-sm text-gray-600 mt-1">
                See how your brand elements will look on your new website
              </p>
            </CardHeader>
            <CardContent>
              <div
                className="p-8 rounded-lg"
                style={{
                  backgroundColor: extractedBrand.colors.background,
                  color: extractedBrand.colors.text,
                }}
              >
                {extractedBrand.logo && (
                  <img
                    src={extractedBrand.logo}
                    alt="Logo preview"
                    className="h-12 mb-6"
                  />
                )}
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{
                    fontFamily: extractedBrand.fonts.heading,
                    color: extractedBrand.colors.primary,
                  }}
                >
                  Your Business Name
                </h2>
                <p
                  className="text-lg mb-6"
                  style={{ fontFamily: extractedBrand.fonts.body }}
                >
                  This is how your content will look with your brand colors and fonts applied.
                </p>
                <button
                  className="px-6 py-3 rounded-lg font-medium"
                  style={{
                    backgroundColor: extractedBrand.colors.primary,
                    color: '#ffffff',
                  }}
                >
                  Call to Action
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setExtractedBrand(null);
                setLogoFile(null);
              }}
            >
              Extract Again
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleComplete}
            >
              <Check className="w-5 h-5" />
              Use This Branding
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Type extension for Button component to support 'as' prop
declare module './Button' {
  interface ButtonProps {
    as?: 'button' | 'span';
  }
}