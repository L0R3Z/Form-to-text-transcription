function exportFormToTextFileEnhanced() {
  // Open the form by its ID
  var form = FormApp.openById("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"); // Replace with your form's ID
  
  // Get the form title and description
  var formTitle = form.getTitle();
  var formDescription = form.getDescription();
  
  // Collect all sections and their questions
  var items = form.getItems();
  var sections = [];
  var currentSection = { title: "General", description: "", questions: [] }; // Default section
  var questionNumber = 0; // To reset numbering by section
  
  items.forEach(function(item) {
    var itemType = item.getType();
    
    if (itemType == FormApp.ItemType.PAGE_BREAK) {
      // Start a new section: Push current section and reset to the next one
      if (currentSection.questions.length > 0) {
        sections.push(currentSection);
      }
      
      // Capture the section title and description (help text)
      var pageBreakItem = item.asPageBreakItem();
      currentSection = { 
        title: pageBreakItem.getTitle(), 
        description: pageBreakItem.getHelpText(), // Capture the description from help text
        questions: []
      };
      questionNumber = 0; // Reset question numbering for the new section
    } else if (itemType == FormApp.ItemType.SECTION_HEADER) {
      // Start a new section: Push current section and reset to the next one
      if (currentSection.questions.length > 0) {
        sections.push(currentSection);
      }
      
      // Capture the section title and description (description text)
      var sectionHeaderItem = item.asSectionHeaderItem();
      currentSection = { 
        title: sectionHeaderItem.getTitle(), 
        description: sectionHeaderItem.getHelpText(), // Capture the description from help text
        questions: []
      };
      questionNumber = 0; // Reset question numbering for the new section
    } else {
      questionNumber++; // Increment question number for each new question in the section
      var questionText = questionNumber + ". " + item.getTitle();
      var choicesText = "";

      // Handle questions with choices
      if (itemType == FormApp.ItemType.MULTIPLE_CHOICE) {
        var mcItem = item.asMultipleChoiceItem();
        var choices = mcItem.getChoices();
        choicesText = choices.map(function(choice) {
          return "   - " + choice.getValue();
        }).join("\n");

        if (mcItem.hasOtherOption()) {
          choicesText += "\n   - Other (write something about it)";
        }
      } else if (itemType == FormApp.ItemType.LIST) {
        var listItem = item.asListItem();
        var choices = listItem.getChoices();
        choicesText = choices.map(function(choice) {
          return "   - " + choice.getValue();
        }).join("\n");
        
        if (listItem.hasOtherOption()) {
          choicesText += "\n   - Other (write something about it)";
        }
      } else if (itemType == FormApp.ItemType.CHECKBOX) {
        var checkboxItem = item.asCheckboxItem();
        var choices = checkboxItem.getChoices();
        choicesText = choices.map(function(choice) {
          return "   - " + choice.getValue();
        }).join("\n");
      }
      
      // Add question text and its choices (if any) to the current section
      currentSection.questions.push(questionText + (choicesText ? "\n" + choicesText : ""));
    }
  });

  // Add the last section if it contains any questions
  if (currentSection.questions.length > 0) {
    sections.push(currentSection);
  }
  
  // Combine the content: title, description, and sections
  var content = `Form Title: ${formTitle}\n\nForm Description: ${formDescription}\n\n`;
  sections.forEach(function(section) {
    content += `Section: ${section.title}\n`;
    if (section.description) {
      content += `Description: ${section.description}\n\n`;
    }
    content += section.questions.join("\n\n") + "\n\n";
  });
  
  // Check if the file already exists in Google Drive
  var fileName = formTitle + ".txt"; // File name matches form title
  var files = DriveApp.getFilesByName(fileName);
  
  if (files.hasNext()) {
    // If the file exists, update its content
    var file = files.next();
    file.setContent(content);
    Logger.log("File updated: " + file.getUrl());
  } else {
    // If the file doesn't exist, create a new one
    var folder = DriveApp.getRootFolder(); // Save in the root folder
    var file = folder.createFile(fileName, content);
    Logger.log("New file created: " + file.getUrl());
  }
}
