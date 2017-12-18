git add -A
read -p "Enter commit message: "  msg
git commit -m "$msg"
git push origin master