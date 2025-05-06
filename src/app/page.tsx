'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowUpTrayIcon, 
  LanguageIcon, 
  DocumentTextIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import './globals.css';
import toast from 'react-hot-toast';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

const subtitleFormats = [
  { code: 'srt', name: 'SubRip (SRT)' },
  { code: 'vtt', name: 'WebVTT (VTT)' },
  { code: 'ass', name: 'Advanced SubStation Alpha (ASS)' },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [outputFormat, setOutputFormat] = useState('srt');
  const [translate, setTranslate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFile = acceptedFiles[0];
    if (audioFile) {
      setFile(audioFile);
      toast.success('File uploaded successfully!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
    },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please upload a file first!');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    console.log('Starting subtitle generation...');

    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      console.log('Uploading file:', file.name);

      const uploadResponse = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('Upload error:', errorData);
        throw new Error(`Failed to upload file: ${errorData.detail || 'Unknown error'}`);
      }

      const { filename } = await uploadResponse.json();
      console.log('File uploaded successfully:', filename);
      setProgress(30);

      // Generate subtitles
      console.log('Generating subtitles...');
      const subtitleResponse = await fetch(`http://localhost:8000/api/generate-subtitles?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_language: targetLanguage,
          output_format: outputFormat,
          translate,
        }),
      });

      if (!subtitleResponse.ok) {
        const errorData = await subtitleResponse.json();
        console.error('Subtitle generation error:', errorData);
        throw new Error(`Failed to generate subtitles: ${errorData.detail || 'Unknown error'}`);
      }

      const { subtitle_file, subtitles: generatedSubtitles } = await subtitleResponse.json();
      console.log('Subtitles generated successfully');
      setSubtitles(generatedSubtitles);
      setProgress(100);

      // Download the subtitle file
      window.location.href = `http://localhost:8000/api/download/${subtitle_file}`;

      toast.success('Subtitles generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate subtitles. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleEdit = async (index: number, field: string, value: any) => {
    const updatedSubtitles = subtitles.map((sub, i) => {
      if (i === index) {
        return { ...sub, [field]: value };
      }
      return sub;
    });
    setSubtitles(updatedSubtitles);
  };

  const handleSaveEdits = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/edit-subtitles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file?.name,
          edits: subtitles,
          output_format: outputFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save edits');
      }

      const { subtitle_file } = await response.json();
      window.location.href = `http://localhost:8000/api/download/${subtitle_file}`;
      toast.success('Edits saved successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save edits. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Subtitle Generator
          </h1>
          <p className="text-xl text-gray-600">
            Upload your audio or video file to generate subtitles
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
          <div
            {...getRootProps()}
            className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
              ${isDragActive 
                ? 'border-primary bg-blue-50 scale-105' 
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
          >
            <input {...getInputProps()} />
            <ArrowUpTrayIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 mb-2">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop your file here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supports MP3, WAV, M4A, MP4, AVI, MOV, MKV
            </p>
          </div>

          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-primary" />
                Selected file: <span className="font-medium ml-1">{file.name}</span>
              </p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language
              </label>
              <div className="relative">
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-md bg-white"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <LanguageIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <div className="relative">
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-md bg-white"
                >
                  {subtitleFormats.map((format) => (
                    <option key={format.code} value={format.code}>
                      {format.name}
                    </option>
                  ))}
                </select>
                <DocumentTextIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={translate}
                onChange={(e) => setTranslate(e.target.checked)}
                className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">
                Translate subtitles to target language
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || isProcessing}
            className={`mt-8 w-full py-4 px-6 rounded-xl text-white font-medium text-lg transition-all duration-300 transform
              ${
                !file || isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
              }`}
          >

            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Processing...
              </div>
            ) : (
              'Generate Subtitles'
            )}
          </button>

          {isProcessing && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                {progress}% Complete
              </p>
            </div>
          )}

          {subtitles.length > 0 && (
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Generated Subtitles</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-secondary transition-colors"
                >
                  {isEditing ? (
                    <>
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Cancel Editing
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-5 w-5 mr-2" />
                      Edit Subtitles
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {subtitles.map((subtitle, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                              type="number"
                              value={subtitle.start}
                              onChange={(e) => handleEdit(index, 'start', parseFloat(e.target.value))}
                              className="block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                              placeholder="Start time"
                            />
                          </div>
                          <div className="relative">
                            <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                              type="number"
                              value={subtitle.end}
                              onChange={(e) => handleEdit(index, 'end', parseFloat(e.target.value))}
                              className="block w-full pl-10 pr-3 py-2 text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                              placeholder="End time"
                            />
                          </div>
                        </div>
                        <textarea
                          value={subtitle.text}
                          onChange={(e) => handleEdit(index, 'text', e.target.value)}
                          className="block w-full px-3 py-2 text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {subtitle.start.toFixed(2)}s - {subtitle.end.toFixed(2)}s
                        </p>
                        <p className="mt-2 text-gray-900">{subtitle.text}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <button
                  onClick={handleSaveEdits}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium hover:from-secondary hover:to-primary transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-center">
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Save Edits
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 