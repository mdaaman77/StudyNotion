export const formattedDate = (date) => {
    //for formatting date 
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
        
    })
  }
