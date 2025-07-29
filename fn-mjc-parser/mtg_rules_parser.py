import json
import re

def parse_mtg_rules(file_path: str) -> dict:
    """Parse the MTG rules text file and return structured JSON data with mtgrules parent object."""
    with open(file_path, 'r', encoding='utf-8-sig') as file:  # utf-8-sig handles BOM
        content = file.read()
    
    # Find where the actual rules start by looking for "1. Game Concepts"
    lines = content.split('\n')
    rules_start = -1
    
    # Look for the actual start of rules content
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if line_stripped == "1. Game Concepts":
            rules_start = i
            break
    
    if rules_start == -1:
        return {"mtgrules": []}
    
    # Process all lines from rules start to end (we'll stop when we hit actual glossary content)
    sections = []
    current_section = None
    current_rule = None
    
    # Process lines from rules start to end
    i = rules_start
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        
        # Stop if we hit the actual glossary content (entries starting with a word in caps)
        if (line and not re.match(r'^\d', line) and 
            not line.startswith('Example:') and 
            not line.startswith('Note:') and
            line == line.upper() and
            len(line.split()) == 1 and
            current_section is not None):
            break
        
        # Main section header (single digit: "1. Game Concepts", "2. Parts of a Card", etc.)
        section_match = re.match(r'^(\d)\.\s+(.+)$', line)
        if section_match:
            section_num = section_match.group(1)
            section_title = section_match.group(2)
            current_section = {
                "section": section_num,
                "title": section_title,
                "rules": []
            }
            sections.append(current_section)
            current_rule = None
            i += 1
            continue
        
        # Rule header (3-digit numbers: "100. General", "101. The Magic Golden Rules", etc.)
        rule_match = re.match(r'^(\d{3})\.\s+(.+)$', line)
        if rule_match:
            rule_num = rule_match.group(1)
            rule_title = rule_match.group(2)
            
            # Determine which section this rule belongs to based on rule number
            section_num = rule_num[0]  # First digit of rule number
            
            # Find or create the appropriate section
            target_section = None
            for section in sections:
                if section["section"] == section_num:
                    target_section = section
                    break
            
            if not target_section:
                # Create section if it doesn't exist
                section_titles = {
                    "1": "Game Concepts",
                    "2": "Parts of a Card", 
                    "3": "Card Types",
                    "4": "Zones",
                    "5": "Turn Structure",
                    "6": "Spells, Abilities, and Effects",
                    "7": "Additional Rules",
                    "8": "Multiplayer Rules",
                    "9": "Casual Variants"
                }
                target_section = {
                    "section": section_num,
                    "title": section_titles.get(section_num, f"Section {section_num}"),
                    "rules": []
                }
                sections.append(target_section)
            
            current_rule = {
                "rule": rule_num,
                "title": rule_title,
                "subrules": [],
                "examples": []
            }
            target_section["rules"].append(current_rule)
            current_section = target_section
            
            # Look for examples immediately following this rule
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if next_line.startswith('Example:'):
                    example_text = next_line[8:].strip()  # Remove 'Example:' prefix
                    current_rule["examples"].append(example_text)
                    i += 1
                else:
                    break
            continue
        
        # Subrule (decimal format: "100.1. Text", "100.1a. Text", etc.)
        subrule_match = re.match(r'^(\d+\.\d+[a-z]*)\.\s+(.+)$', line)
        if subrule_match and current_rule:
            subrule_num = subrule_match.group(1)
            subrule_text = subrule_match.group(2)
            subrule_data = {
                "subrule": subrule_num,
                "text": subrule_text,
                "examples": []
            }
            current_rule["subrules"].append(subrule_data)
            
            # Look for examples immediately following this subrule
            i += 1
            while i < len(lines):
                next_line = lines[i].strip()
                if next_line.startswith('Example:'):
                    example_text = next_line[8:].strip()  # Remove 'Example:' prefix
                    subrule_data["examples"].append(example_text)
                    i += 1
                else:
                    break
            continue
        
        # Skip other content (like standalone examples, notes, etc.)
        i += 1
    
    return {"mtgrules": sections}

def save_to_json(data: dict, output_path: str):
    """Save the parsed data to a JSON file."""
    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)
    print(f"Rules data saved to {output_path}")

def main():
    input_file = "rules.txt"
    output_file = "rules.json"
    
    try:
        print("Parsing MTG rules...")
        parsed_data = parse_mtg_rules(input_file)
        save_to_json(parsed_data, output_file)
        print(f"Parsed {len(parsed_data['mtgrules'])} sections successfully.")
        
    except FileNotFoundError:
        print(f"Error: Could not find the file '{input_file}'")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
