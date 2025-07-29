#!/usr/bin/env python3
"""
MTG Glossary Parser
Converts MTG glossary text files to JSON format.
"""

import json
import sys
from pathlib import Path
from typing import List, Dict


def parse_glossary(file_path: str) -> Dict[str, List[Dict[str, str]]]:
    """
    Parse a glossary text file and convert it to JSON structure.
    
    Args:
        file_path: Path to the glossary text file
        
    Returns:
        Dictionary with glossary entries in the specified format
    """
    glossary_entries = []
    
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines
        if not line:
            i += 1
            continue
            
        # Found a term
        term = line
        definition_lines = []
        i += 1
        
        # Collect definition lines until we hit an empty line or end of file
        while i < len(lines) and lines[i].strip():
            definition_lines.append(lines[i].strip())
            i += 1
        
        # Join all definition lines into a single text
        definition_text = ' '.join(definition_lines)
        
        # Add to glossary entries
        glossary_entries.append({
            "term": term,
            "text": definition_text
        })
    
    return {"glossary": glossary_entries}


def main():
    """Main function to run the parser."""
    if len(sys.argv) != 3:
        print("Usage: python glossary_parser.py <input_file> <output_file>")
        print("Example: python glossary_parser.py glossary_example.txt glossary.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Check if input file exists
    if not Path(input_file).exists():
        print(f"Error: Input file '{input_file}' not found.")
        sys.exit(1)
    
    try:
        # Parse the glossary
        glossary_data = parse_glossary(input_file)
        
        # Write to JSON file
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(glossary_data, file, indent=2, ensure_ascii=False)
        
        print(f"Successfully converted '{input_file}' to '{output_file}'")
        print(f"Parsed {len(glossary_data['glossary'])} glossary entries")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 