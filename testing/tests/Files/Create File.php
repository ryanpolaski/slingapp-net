<?php
/**
 * Created by PhpStorm.
 * User: Isaac
 * Date: 1/11/2017
 * Time: 8:21 PM
 * Test Name: Test Downloading/Uploading Files
 * Description: ensures files can be sent and recieved from the database
 */

require_once "classes/Room.php";
require_once "classes/Chat.php";
require_once "classes/Message.php";

$account = Account::CreateAccount("testemail@test.com", "Bob", "Marley", "password");
$token = $account->getToken();
$room = Room::createRoom("Test File Upload");
$room->addParticipant($account, "host");

$room->addMessage(0, $room->getRoomID(), $account->getAccountID(), "test", "tests/Files/test.txt");

assert($room->getChat()->_files[0]->getMime() == "text", "MIME type is text");

function cleanup(){
    try{
        require_once "classes/Database.php";
        try {
            $sql = "SELECT r.RoomID, a.AccountID
                FROM Accounts AS a
                LEFT JOIN RoomAccount AS ra
                    ON a.AccountID = ra.AccountID
                LEFT JOIN Rooms AS r
                    ON ra.RoomID = r.RoomID
                WHERE (Email = 'testemail@test.com')";
            $statement = Database::connect()->prepare($sql);
            $statement->execute();
            $result = $statement->fetchAll(PDO::FETCH_ASSOC);

            Database::connect()->query("DELETE
                                        FROM Files
                                        WHERE (Filename = 'test.txt')");

            foreach ($result as $row) {
                if ($row['RoomID'] != null) {
                    $sql = "DELETE
                FROM messages
                WHERE RoomID = :roomID";
                    Database::connect()->prepare($sql)->execute(array(':roomID' => $row['RoomID']));
                    $sql = "DELETE
                FROM RoomCodes
                WHERE RoomID = :roomID";
                    Database::connect()->prepare($sql)->execute(array(':roomID' => $row['RoomID']));
                    $sql = "DELETE
                FROM RoomAccount
                WHERE RoomID = :roomID";
                    Database::connect()->prepare($sql)->execute(array(':roomID' => $row['RoomID']));
                    $sql = "DELETE
                FROM Rooms
                WHERE RoomID = :roomID";
                    Database::connect()->prepare($sql)->execute(array(':roomID' => $row['RoomID']));
                }
                $sql = "DELETE
                FROM Accounts
                WHERE AccountID = :accountID";
                Database::connect()->prepare($sql)->execute(array(':accountID' => $row['AccountID']));
            }
        } catch
        (Exception $e) {
        }
    }catch (Exception $e){}
}